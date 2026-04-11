# GRPO/RL Training Skill

**Expert-level guidance for Group Relative Policy Optimization with TRL**

## 📁 Skill Structure

```
grpo-rl-training/
├── SKILL.md                              # Main skill documentation (READ THIS FIRST)
├── README.md                             # This file
├── templates/
│   └── basic_grpo_training.py            # Production-ready training template
└── examples/
    └── reward_functions_library.py       # 20+ reward function examples
```

## 🚀 Quick Start

1. **Read SKILL.md** - Comprehensive guide with all concepts and patterns
2. **Copy `templates/basic_grpo_training.py`** - Start with working code
3. **Browse `examples/reward_functions_library.py`** - Pick reward functions for your task
4. **Modify for your use case** - Adapt dataset, rewards, and config

## 💡 What's Inside

### SKILL.md (Main Documentation)
- Core GRPO concepts and algorithm fundamentals
- Complete implementation workflow (dataset → rewards → training → deployment)
- 10+ reward function examples with code
- Hyperparameter tuning guide
- Training insights (loss behavior, metrics, debugging)
- Troubleshooting guide
- Production best practices

### Templates
- **basic_grpo_training.py**: Minimal, production-ready training script
  - Uses Qwen 2.5 1.5B Instruct
  - 3 reward functions (format + correctness)
  - LoRA for efficient training
  - Fully documented and ready to run

### Examples
- **reward_functions_library.py**: 20+ battle-tested reward functions
  - Correctness rewards (exact match, fuzzy match, numeric, code execution)
  - Format rewards (XML, JSON, strict/soft)
  - Length rewards (ideal length, min/max)
  - Style rewards (reasoning quality, citations, repetition penalty)
  - Combined rewards (multi-objective optimization)
  - Preset collections for common tasks

## 📖 Usage for Agents

When this skill is loaded in your agent's context:

1. **Always read SKILL.md first** before implementing
2. **Start simple** - Use length-based reward to validate setup
3. **Build incrementally** - Add one reward function at a time
4. **Reference examples** - Copy patterns from reward_functions_library.py
5. **Monitor training** - Watch reward metrics (not loss!)

## 🎯 Common Use Cases

| Task Type | Recommended Rewards | Template |
|-----------|---------------------|----------|
| Math reasoning | `MATH_REASONING_REWARDS` preset | basic_grpo_training.py |
| Code generation | `CODE_GENERATION_REWARDS` preset | Modify dataset in template |
| Summarization | `SUMMARIZATION_REWARDS` preset | Adjust prompts + rewards |
| Q&A | `QA_REWARDS` preset | Use fuzzy match + citations |

## ⚠️ Critical Reminders

- **Loss goes UP during training** - This is normal (it's KL divergence)
- **Use 3-5 reward functions** - Single rewards often fail
- **Test rewards before training** - Debug each function independently
- **Monitor reward_std** - Should stay > 0.1 (avoid mode collapse)
- **Start with num_generations=4-8** - Scale up if GPU allows

## 🔗 External Resources

- [TRL Documentation](https://huggingface.co/docs/trl)
- [DeepSeek R1 Paper](https://arxiv.org/abs/2501.12948)
- [Open R1 Implementation](https://github.com/huggingface/open-r1)
- [Unsloth (2-3x faster)](https://docs.unsloth.ai/)

## 📝 Version

**v1.0.0** - Initial release (January 2025)

## 👨‍💻 Maintained By

Orchestra Research
For questions or improvements, see https://orchestra.com

---

**License:** MIT
**Last Updated:** January 2025
