# AAAI 2026 统一LaTeX模板使用说明 / AAAI 2026 Unified LaTeX Template Guide

> **📝 重要说明 / Important Notice**: 本仓库借助Cursor在AAAI 2026官方模板基础上改进得到。如果遇到不满足或有冲突的情况，请积极提issues。
> 
> **📝 Important Notice**: This repository is improved based on the official AAAI 2026 template with the assistance of Cursor. If you encounter any issues or conflicts, please actively submit issues.

[中文](#中文版本) | [English](#english-version)

---

## 🌐 在线查看 / Online Access

**📖 在线阅读和测试模板**: [https://cn.overleaf.com/read/wyhcnvcrtpyt#cd4a07](https://cn.overleaf.com/read/wyhcnvcrtpyt#cd4a07)

**📖 Online View and Test Template**: [https://cn.overleaf.com/read/wyhcnvcrtpyt#cd4a07](https://cn.overleaf.com/read/wyhcnvcrtpyt#cd4a07)

💡 **提示 / Tips**: 
- 中文：您可以通过上述链接在Overleaf中直接查看、编辑和编译模板，无需本地安装LaTeX环境
- English: You can view, edit, and compile the template directly in Overleaf using the link above, without needing a local LaTeX installation

---

## 中文版本

### 概述 ✅

我已经将AAAI 2026的两个版本（匿名投稿版本和camera-ready版本）**完整合并**成一个统一的模板文件 `aaai2026-unified-template.tex`。

该模板包含了原始两个模板的**所有完整内容**（共886行，比原始文件更全面），包括：
- 所有格式化说明和要求
- 完整的示例代码和表格
- 图片处理指南
- 参考文献格式要求
- 所有章节和附录内容
- 版本特定的Acknowledgments部分

### 主要差异分析

通过比较原始的两个模板，我发现主要差异在于：

#### 1. 包的加载方式
- **匿名版本**: `\usepackage[submission]{aaai2026}`
- **Camera-ready版本**: `\usepackage{aaai2026}`

#### 2. 标题差异
- **匿名版本**: "AAAI Press Anonymous Submission Instructions for Authors Using LaTeX"
- **Camera-ready版本**: "AAAI Press Formatting Instructions for Authors Using LaTeX --- A Guide"

#### 3. Links环境的处理
- **匿名版本**: Links环境被注释掉，防止泄露作者身份
- **Camera-ready版本**: Links环境正常显示

#### 4. 内容部分差异
- **匿名版本**: 包含"Preparing an Anonymous Submission"部分的特殊说明
- **Camera-ready版本**: 包含完整的格式说明和版权信息

### 依赖文件检查结果

✅ **已验证并复制到主目录的文件**：

- `aaai2026.sty` - AAAI 2026 样式文件（两个版本完全相同）
- `aaai2026.bst` - 参考文献样式文件（两个版本完全相同）
- `aaai2026.bib` - 示例参考文献文件
- `figure1.pdf` 和 `figure2.pdf` - 示例图片文件

所有这些文件在两个版本中都是相同的，因此统一模板可以正常工作。

### 如何使用统一模板

#### 切换到匿名投稿版本
在模板文件第11行，**取消注释**这一行：
```latex
\def\aaaianonymous{true}
```

#### 切换到Camera-ready版本
在模板文件第11行，**注释掉**或**删除**这一行：
```latex
% \def\aaaianonymous{true}
```

### 一键切换的核心机制

统一模板使用了LaTeX的条件编译功能：

```latex
% 条件包加载
\ifdefined\aaaianonymous
    \usepackage[submission]{aaai2026}  % 匿名版本
\else
    \usepackage{aaai2026}              % Camera-ready版本
\fi

% 条件标题设置
\ifdefined\aaaianonymous
    \title{AAAI Press Anonymous Submission\\Instructions for Authors Using \LaTeX{}}
\else
    \title{AAAI Press Formatting Instructions \\for Authors Using \LaTeX{} --- A Guide}
\fi

% 条件内容显示
\ifdefined\aaaianonymous
    % 匿名版本特有内容
\else
    % Camera-ready版本特有内容
\fi
```

### 文件清单

主目录现在包含以下文件：

- `aaai2026-unified-template.tex` - 统一主论文模板文件
- `aaai2026-unified-supp.tex` - 统一补充材料模板文件
- `aaai2026.sty` - AAAI 2026 LaTeX 样式文件
- `aaai2026.bst` - 参考文献样式文件  
- `aaai2026.bib` - 示例参考文献文件
- `figure1.pdf` - 示例图片1
- `figure2.pdf` - 示例图片2
- `README.md` - 本说明文档

### 补充材料模板 (Supplementary Material Template)

#### 概述
`aaai2026-unified-supp.tex` 是专门为AAAI 2026补充材料设计的统一模板，与主论文模板使用相同的版本切换机制。

#### 主要功能
- **版本切换**: 通过修改一行代码在匿名投稿和camera-ready版本间切换
- **补充内容支持**: 支持额外的实验、推导、数据、图表、算法等
- **格式一致性**: 与主论文模板保持完全一致的格式要求
- **代码示例**: 包含算法、代码列表等补充材料的示例

#### 使用方法
与主论文模板相同，只需修改第11行：
```latex
% 匿名投稿版本
\def\aaaianonymous{true}

% Camera-ready版本  
% \def\aaaianonymous{true}
```

#### 补充材料内容建议
- 额外的实验结果和消融研究
- 详细的数学推导和证明
- 更多的图表和可视化
- 算法伪代码和实现细节
- 数据集描述和预处理步骤
- 超参数设置和实验配置
- 失败案例分析
- 计算复杂度分析

### 使用检查清单 (Usage Checklist)

#### 📋 投稿前检查清单 (Pre-Submission Checklist)

**版本设置**:
- [ ] 已设置 `\def\aaaianonymous{true}` (匿名投稿)
- [ ] 已注释掉所有可能暴露身份的信息
- [ ] 已匿名化参考文献（移除作者姓名）

**内容完整性**:
- [ ] 标题、摘要、关键词已填写
- [ ] 所有章节内容完整
- [ ] 图表编号连续且正确
- [ ] 参考文献格式正确
- [ ] 补充材料（如有）已准备

**格式检查**:
- [ ] 页面边距符合要求
- [ ] 字体和字号正确
- [ ] 行间距符合标准
- [ ] 图表位置和大小合适
- [ ] 数学公式格式正确

**技术检查**:
- [ ] LaTeX编译无错误
- [ ] 参考文献正确生成
- [ ] PDF输出正常
- [ ] 文件大小在限制范围内

#### 📋 录用后检查清单 (Post-Acceptance Checklist)

**版本切换**:
- [ ] 已注释掉 `\def\aaaianonymous{true}` (camera-ready)
- [ ] 已添加完整的作者信息
- [ ] 已添加所有作者单位信息
- [ ] 已恢复所有被注释的内容

**内容更新**:
- [ ] 已根据审稿意见修改内容
- [ ] 已更新所有图表和实验
- [ ] 已完善补充材料
- [ ] 已检查所有链接和引用

**最终检查**:
- [ ] 最终PDF质量检查
- [ ] 所有文件已备份
- [ ] 符合会议最终提交要求
- [ ] 补充材料已单独提交（如需要）

#### 📋 补充材料检查清单 (Supplementary Material Checklist)

**内容组织**:
- [ ] 补充材料与主论文内容对应
- [ ] 章节结构清晰合理
- [ ] 图表编号与主论文不冲突
- [ ] 参考文献格式一致

**技术细节**:
- [ ] 算法伪代码清晰完整
- [ ] 实验设置详细说明
- [ ] 数据预处理步骤明确
- [ ] 超参数配置完整

**格式要求**:
- [ ] 使用统一的supp模板
- [ ] 页面设置与主论文一致
- [ ] 字体和格式符合要求
- [ ] 文件大小在限制范围内

### 实际使用建议

1. **投稿阶段**: 
   - 取消注释 `\def\aaaianonymous{true}` 
   - 确保不包含任何可能暴露身份的信息
   - 检查参考文献是否已匿名化

2. **录用后准备final版本**:
   - 注释掉或删除 `\def\aaaianonymous{true}` 这一行
   - 添加完整的作者信息和affiliations
   - 取消注释links环境（如果需要）

3. **编译测试**:
   - 分别在两种模式下编译，确保都能正常工作
   - 检查输出的PDF是否符合要求
   - 验证参考文献格式是否正确

4. **依赖文件确认**:
   - 确保所有依赖文件都在同一目录下
   - 如果移动模板文件，记得同时移动依赖文件

### 重要注意事项

⚠️ **关于Bibliography Style**:
- `aaai2026.sty`文件已经自动设置了`\bibliographystyle{aaai2026}`
- **不要**在文档中再次添加`\bibliographystyle{aaai2026}`命令
- 否则会出现"`Illegal, another \bibstyle command`"错误
- 只需要使用`\bibliography{aaai2026}`命令即可

### 编译命令示例

```bash
# 编译LaTeX文档
pdflatex aaai2026-unified-template.tex
bibtex aaai2026-unified-template
pdflatex aaai2026-unified-template.tex
pdflatex aaai2026-unified-template.tex
```

### 常见问题解决

#### 1. "Illegal, another \bibstyle command"错误
**原因**: 重复设置了bibliography style  
**解决方案**: 删除文档中的`\bibliographystyle{aaai2026}`命令，`aaai2026.sty`会自动处理

#### 2. 参考文献格式不正确
**原因**: 可能缺少natbib包或者BibTeX文件问题  
**解决方案**: 确保按照标准的LaTeX编译流程：pdflatex → bibtex → pdflatex → pdflatex

---

## English Version

### Overview ✅

I have **completely merged** the two AAAI 2026 versions (anonymous submission and camera-ready) into a single unified template file `aaai2026-unified-template.tex`.

This template contains **all complete content** from both original templates (886 lines total, more comprehensive than the original files), including:
- All formatting instructions and requirements
- Complete example codes and tables
- Image processing guidelines
- Reference formatting requirements
- All sections and appendix content
- Version-specific Acknowledgments sections

### Key Differences Analysis

By comparing the two original templates, the main differences are:

#### 1. Package Loading Method
- **Anonymous version**: `\usepackage[submission]{aaai2026}`
- **Camera-ready version**: `\usepackage{aaai2026}`

#### 2. Title Differences
- **Anonymous version**: "AAAI Press Anonymous Submission Instructions for Authors Using LaTeX"
- **Camera-ready version**: "AAAI Press Formatting Instructions for Authors Using LaTeX --- A Guide"

#### 3. Links Environment Handling
- **Anonymous version**: Links environment commented out to prevent identity disclosure
- **Camera-ready version**: Links environment displayed normally

#### 4. Content Section Differences
- **Anonymous version**: Contains special instructions in "Preparing an Anonymous Submission" section
- **Camera-ready version**: Contains complete formatting instructions and copyright information

### Dependency Files Verification

✅ **Files verified and copied to main directory**:

- `aaai2026.sty` - AAAI 2026 style file (identical in both versions)
- `aaai2026.bst` - Bibliography style file (identical in both versions)
- `aaai2026.bib` - Sample bibliography file
- `figure1.pdf` and `figure2.pdf` - Sample image files

All these files are identical in both versions, so the unified template works properly.

### How to Use the Unified Template

#### Switch to Anonymous Submission Version
On line 11 of the template file, **uncomment** this line:
```latex
\def\aaaianonymous{true}
```

#### Switch to Camera-ready Version
On line 11 of the template file, **comment out** or **delete** this line:
```latex
% \def\aaaianonymous{true}
```

### Core Mechanism of One-Click Switching

The unified template uses LaTeX conditional compilation:

```latex
% Conditional package loading
\ifdefined\aaaianonymous
    \usepackage[submission]{aaai2026}  % Anonymous version
\else
    \usepackage{aaai2026}              % Camera-ready version
\fi

% Conditional title setting
\ifdefined\aaaianonymous
    \title{AAAI Press Anonymous Submission\\Instructions for Authors Using \LaTeX{}}
\else
    \title{AAAI Press Formatting Instructions \\for Authors Using \LaTeX{} --- A Guide}
\fi

% Conditional content display
\ifdefined\aaaianonymous
    % Anonymous version specific content
\else
    % Camera-ready version specific content
\fi
```

### File List

The main directory now contains the following files:

- `aaai2026-unified-template.tex` - Unified main paper template file
- `aaai2026-unified-supp.tex` - Unified supplementary material template file
- `aaai2026.sty` - AAAI 2026 LaTeX style file
- `aaai2026.bst` - Bibliography style file
- `aaai2026.bib` - Sample bibliography file
- `figure1.pdf` - Sample image 1
- `figure2.pdf` - Sample image 2
- `README.md` - This documentation

### Supplementary Material Template

#### Overview
`aaai2026-unified-supp.tex` is a unified template specifically designed for AAAI 2026 supplementary materials, using the same version switching mechanism as the main paper template.

#### Key Features
- **Version Switching**: Switch between anonymous submission and camera-ready versions by modifying one line of code
- **Supplementary Content Support**: Supports additional experiments, derivations, data, figures, algorithms, etc.
- **Format Consistency**: Maintains complete format consistency with the main paper template
- **Code Examples**: Includes examples for algorithms, code listings, and other supplementary materials

#### Usage
Same as the main paper template, just modify line 11:
```latex
% Anonymous submission version
\def\aaaianonymous{true}

% Camera-ready version
% \def\aaaianonymous{true}
```

#### Supplementary Material Content Suggestions
- Additional experimental results and ablation studies
- Detailed mathematical derivations and proofs
- More figures and visualizations
- Algorithm pseudocode and implementation details
- Dataset descriptions and preprocessing steps
- Hyperparameter settings and experimental configurations
- Failure case analysis
- Computational complexity analysis

### Usage Checklist

#### 📋 Pre-Submission Checklist

**Version Setup**:
- [ ] Set `\def\aaaianonymous{true}` (anonymous submission)
- [ ] Commented out all information that could reveal identity
- [ ] Anonymized references (removed author names)

**Content Completeness**:
- [ ] Title, abstract, and keywords filled
- [ ] All sections complete
- [ ] Figure and table numbers consecutive and correct
- [ ] Reference format correct
- [ ] Supplementary materials prepared (if any)

**Format Check**:
- [ ] Page margins meet requirements
- [ ] Font and font size correct
- [ ] Line spacing meets standards
- [ ] Figure and table positions and sizes appropriate
- [ ] Mathematical formula format correct

**Technical Check**:
- [ ] LaTeX compilation error-free
- [ ] References generated correctly
- [ ] PDF output normal
- [ ] File size within limits

#### 📋 Post-Acceptance Checklist

**Version Switch**:
- [ ] Commented out `\def\aaaianonymous{true}` (camera-ready)
- [ ] Added complete author information
- [ ] Added all author affiliation information
- [ ] Restored all commented content

**Content Updates**:
- [ ] Modified content according to reviewer comments
- [ ] Updated all figures and experiments
- [ ] Completed supplementary materials
- [ ] Checked all links and citations

**Final Check**:
- [ ] Final PDF quality check
- [ ] All files backed up
- [ ] Meets conference final submission requirements
- [ ] Supplementary materials submitted separately (if needed)

#### 📋 Supplementary Material Checklist

**Content Organization**:
- [ ] Supplementary materials correspond to main paper content
- [ ] Chapter structure clear and reasonable
- [ ] Figure and table numbers don't conflict with main paper
- [ ] Reference format consistent

**Technical Details**:
- [ ] Algorithm pseudocode clear and complete
- [ ] Experimental setup explained in detail
- [ ] Data preprocessing steps clear
- [ ] Hyperparameter configuration complete

**Format Requirements**:
- [ ] Using unified supp template
- [ ] Page settings consistent with main paper
- [ ] Font and format meet requirements
- [ ] File size within limits

### Practical Usage Recommendations

1. **Submission Stage**: 
   - Uncomment `\def\aaaianonymous{true}` 
   - Ensure no information that could reveal identity is included
   - Check that references are anonymized

2. **Preparing final version after acceptance**:
   - Comment out or delete the `\def\aaaianonymous{true}` line
   - Add complete author information and affiliations
   - Uncomment links environment (if needed)

3. **Compilation Testing**:
   - Compile in both modes to ensure proper functionality
   - Check if the output PDF meets requirements
   - Verify reference formatting is correct

4. **Dependency File Confirmation**:
   - Ensure all dependency files are in the same directory
   - Remember to move dependency files when moving the template file

### Important Notes

⚠️ **About Bibliography Style**:
- The `aaai2026.sty` file automatically sets `\bibliographystyle{aaai2026}`
- **Do NOT** add `\bibliographystyle{aaai2026}` command again in your document
- Otherwise you'll get "`Illegal, another \bibstyle command`" error
- Just use the `\bibliography{aaai2026}` command

### Compilation Commands Example

```bash
# Compile LaTeX document
pdflatex aaai2026-unified-template.tex
bibtex aaai2026-unified-template
pdflatex aaai2026-unified-template.tex
pdflatex aaai2026-unified-template.tex
```

### Common Issues and Solutions

#### 1. "Illegal, another \bibstyle command" Error
**Cause**: Duplicate bibliography style setting  
**Solution**: Remove the `\bibliographystyle{aaai2026}` command from your document, `aaai2026.sty` handles it automatically

#### 2. Incorrect Reference Format
**Cause**: Missing natbib package or BibTeX file issues  
**Solution**: Follow the standard LaTeX compilation process: pdflatex → bibtex → pdflatex → pdflatex

---

## 版本信息 / Version Information

- **模板版本 / Template Version**: AAAI 2026 Unified (Main + Supplementary)
- **创建日期 / Created**: 2024年12月
- **支持格式 / Supported Formats**: Anonymous Submission & Camera-Ready
- **模板类型 / Template Types**: Main Paper Template & Supplementary Material Template
- **兼容性 / Compatibility**: LaTeX 2020+ / TeXLive 2024+

---

🎉 **现在您只需要修改一行代码就可以在两个版本之间切换，同时所有必要的依赖文件都已经准备就绪！**  
🎉 **Now you only need to modify one line of code to switch between the two versions, with all necessary dependency files ready to use!**