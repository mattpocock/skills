# max-prd-loop 设计文档

## 背景

2026年4月，pandacooming 在研究如何把 Ralph（一个 autonomous coding agent）的循环模式移植到 Hermes Agent 时，发现：

1. Hermes 官方没有类似的 skill
2. PR #5175（autoresearch）实现了类似功能，但使用了 cron 定时驱动，不符合用户偏好（"不要 cron timer"）
3. 用户倾向于：主 agent 保持控制权，delegate_task 子 agent 执行，每次子 agent 完成后返回主 agent 再继续循环

于是决定从头设计一个 Hermes 原生的 PRD 驱动自主开发循环。

---

## 核心问题

**传统 AI coding agent 的问题：上下文会随着时间变脏。**

- 错误累积、决策前后矛盾、忘记早期约定
- 时间越长，问题越严重，最终要么 agent 迷失，要么结果质量下降

**Ralph 的核心洞察：**

> 与其试图保持 agent 上下文干净，不如每次都用全新的 agent，状态通过文件传递。

---

## 设计演变过程

### 第一步：三个独立 skill

最初参考 Ralph 的实现方式，拆成三个 skill：

- `prd` — 生成 PRD 文档
- `ralph` — 把 PRD markdown 转成 prd.json
- `prd-loop` — 执行自主循环

**问题：** 三个 skill 三套触发方式，用户需要理解它们之间的关系和调用顺序。用户体验割裂。

### 第二步：合并为一个 skill

把三个 skill 合并成 `prd-hermes`，一个 skill 包含完整的三阶段流程：

```
Feature idea
    ↓ Phase 1: 生成 PRD
    ↓ Phase 2: 转换格式
    ↓ Phase 3: 循环执行
```

**原则：用户只需要说"帮我实现这个功能"，剩下的全部自动完成。**

### 第三步：命名

- `ralph-loop` — ❌ 听起来只有循环，名字来自外部工具
- `prd-hermes` — ✅ `prd` 是核心概念，`hermes` 表示这是 Hermes 原生实现

---

## 核心设计决策

### 决策 1：每个 acceptance criterion 完成后立即写 progress.txt

**问题背景：**
子 agent 的上下文会被 Hermes 自动压缩（~50% 时）。如果等到整个 story 完成才写进度，压缩发生时最多丢失整个 story。

**解决方案：**

```
每个 criterion 完成后立即写 checkpoint，不等 story 结束。

US-001 有 5 个 criteria：
  Criterion 1 完成 → 写 progress.txt
  Criterion 2 完成 → 写 progress.txt
  Criterion 3 完成 → 写 progress.txt
       ↓
    上下文在这里被压缩
       ↓
  新子 agent 读 progress.txt
       → 知道 Criterion 3 已完成
       → 从 Criterion 4 继续
       → 最多重做 Criterion 3（不严重）
```

**结论：** 不是"感知压缩再去救"，而是"每个 milestone 都保存进度"，让压缩变得无关紧要。

---

### 决策 2：子 agent 只有两种真正的停止原因

经过梳理，子 agent 停止只有两种：

```
1. ✅ 任务完成
   → 所有 criteria 完成 + commit → status: "complete"

2. ⚠️ 上下文被压缩
   → 发现被压缩了（忘了什么）→ status: "WIP"
```

（第三种：遇到无法恢复的错误 → status: "failed"）

**设计原则：**
- 不是"等满了再停"，而是"被压缩了立即停"
- 子 agent 通过**自我检查**判断是否被压缩："我是否还记得这个 session 开始时的内容？"

---

### 决策 3：子 agent 返回时带结构化的 stop report

子 agent 返回时携带一个明确的状态对象，而不是简单的文本摘要：

```json
{
  "status": "complete" | "WIP" | "failed",
  "story_id": "US-001",
  "criterion_progress": "3/5",
  "commit_sha": "abc123..." | null,
  "learnings": ["pattern discovered"],
  "next_action": "new_agent_continue_same_story" | "move_to_next_story"
}
```

**为什么需要结构化？**
因为主 agent 需要根据 status 做明确的决策：
- `complete` → 下一个 story
- `WIP` → 立即开新子 agent 继续同一个 story
- `failed` → 标记失败，继续下一个 story

如果只是文本摘要，主 agent 需要猜测意图，容易出错。

---

### 决策 4：主 agent 的决策表

主 agent 是一个状态机，根据子 agent 返回的 status 决定下一步：

```
status: "complete"
  → prd.json passes: true
  → progress.txt 追加最终记录
  → 回到 Phase 3a，选下一个 story

status: "WIP"
  → prd.json 保持 passes: false
  → 立即 spawn 新子 agent 继续同一个 story
  → progress.txt 已有 checkpoint，不需要额外操作

status: "failed"
  → prd.json notes: "FAILED: ..."
  → progress.txt 追加失败记录
  → 继续下一个 story
```

---

### 决策 5：progress.txt 的双重用途

同一个文件，服务于两个场景：

| 场景 | progress.txt 内容 | 写入时机 |
|------|------------------|----------|
| WIP checkpoint | `Criterion N/M Complete` + completed/next/files | 每个 criterion 完成后立即 |
| 最终记录 | `— COMPLETE` + commit SHA + learnings | story 全部完成后 |

这使得 `progress.txt` 既是断点续传的依据，也是迭代学习的积累。

---

## prd-hermes vs Ralph（原始版本）

| | Ralph 原版 | prd-hermes |
|---|---|---|
| 循环驱动 | bash 脚本 + cron | 主 agent 控制，delegate_task |
| 状态文件 | prd.json + progress.txt | 相同 |
| 进度保存 | 每个 story 完成后 | **每个 criterion 完成后** |
| 压缩恢复 | 无专门机制 | 每个 criterion 是原子恢复单元 |
| 子 agent 通信 | 依赖返回文本 | 结构化 stop report |
| 适用场景 | Claude Code / Amp | Hermes delegate_task |

**核心区别：** prd-hermes 通过更细粒度的 checkpoint（每个 criterion 一次）解决了子 agent 内部上下文压缩的问题，而原版 Ralph 只考虑了跨 story 的上下文污染。

---

## 状态文件

### prd.json

```json
{
  "project": "项目名",
  "branchName": "prd-hermes/[feature-name]",
  "description": "一句话描述",
  "userStories": [
    {
      "id": "US-001",
      "title": "标题",
      "description": "As a ... I want ... so that ...",
      "acceptanceCriteria": ["criterion 1", "criterion 2", "Typecheck passes"],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### progress.txt

**WIP checkpoint（每个 criterion 完成后）：**
```
## US-001 - Criterion 2/5 Complete
- Completed: 实现 API endpoint 并测试通过
- Next: 添加前端按钮组件
- Files: src/api/likes.py, tests/test_likes.py
```

**最终记录（story 全部完成后）：**
```
## 2026-04-13 14:30 - US-001 — COMPLETE
- All acceptance criteria met
- Files changed: db/migrations/xxx.py, src/api/likes.py, tests/test_likes.py
- Commit: abc123def
- **Learnings:**
  - 这个项目用 pytest 做单元测试，不是 unittest
  - 数据库迁移用 alembic，不是 Django 自带的
---
```

---

## 三个核心原则

### 原则 1：每个 story 干净上下文

每次启动子 agent 都是全新 context，不继承上一轮的 agent 记忆。状态通过 `prd.json` + `progress.txt` 传递，不靠 memory。

### 原则 2：进度立即写出，不到最后

每个 acceptance criterion 完成后立即写入 progress.txt，永远不等到整个 story 结束。这样上下文压缩最多丢失一个 criterion，不是一个 story。

### 原则 3：断点续传永远从最后一个 checkpoint

新子 agent 启动时读 progress.txt，找到 `Criterion N/M Complete` 标记，从下一个 criterion 继续。不猜测，不重复。

---

## 局限性

- **子 agent 自我检测压缩是尽力而为**：无法精确知道压缩何时发生，只能靠"是否忘记了一些事"这种模糊的自我感知。
- **criterion 粒度需要合理**：如果单个 criterion 太大（超过 2-3 轮对话），仍然可能有风险。PRD 生成阶段应确保 criterion 足够小。
- **依赖子 agent 正确返回**：如果子 agent 忘记了这个协议（比如被压缩后继续跑），进度可能丢失。指令的清晰度很重要。

---

## 未来可能的改进方向

1. **acceptance criteria 数量限制**：Phase 1 生成 PRD 时规定每个 story 最多 5 个 criterion，超出的自动拆分
2. **WIP commit 到 git**：当 criterion 数量较多时，可以把 WIP 也 commit 到 git，而不是只写在 progress.txt
3. **主 agent 感知子 agent 存活状态**：不只是等子 agent 返回，而是主动检测子 agent 是否还在运行（这个目前 Hermes delegate_task 不支持）
4. **learnings 跨 story 共享**：当前的 learnings 是 append-only 的，但没有结构化索引。新 story 可以优先参考相关的历史 learnings
