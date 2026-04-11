---
name: axolotl
description: Expert guidance for fine-tuning LLMs with Axolotl - YAML configs, 100+ models, LoRA/QLoRA, DPO/KTO/ORPO/GRPO, multimodal support
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [axolotl, torch, transformers, datasets, peft, accelerate, deepspeed]
metadata:
  hermes:
    tags: [Fine-Tuning, Axolotl, LLM, LoRA, QLoRA, DPO, KTO, ORPO, GRPO, YAML, HuggingFace, DeepSpeed, Multimodal]

---

# Axolotl Skill

Comprehensive assistance with axolotl development, generated from official documentation.

## When to Use This Skill

This skill should be triggered when:
- Working with axolotl
- Asking about axolotl features or APIs
- Implementing axolotl solutions
- Debugging axolotl code
- Learning axolotl best practices

## Quick Reference

### Common Patterns

**Pattern 1:** To validate that acceptable data transfer speeds exist for your training job, running NCCL Tests can help pinpoint bottlenecks, for example:

```
./build/all_reduce_perf -b 8 -e 128M -f 2 -g 3
```

**Pattern 2:** Configure your model to use FSDP in the Axolotl yaml. For example:

```
fsdp_version: 2
fsdp_config:
  offload_params: true
  state_dict_type: FULL_STATE_DICT
  auto_wrap_policy: TRANSFORMER_BASED_WRAP
  transformer_layer_cls_to_wrap: LlamaDecoderLayer
  reshard_after_forward: true
```

**Pattern 3:** The context_parallel_size should be a divisor of the total number of GPUs. For example:

```
context_parallel_size
```

**Pattern 4:** For example: - With 8 GPUs and no sequence parallelism: 8 different batches processed per step - With 8 GPUs and context_parallel_size=4: Only 2 different batches processed per step (each split across 4 GPUs) - If your per-GPU micro_batch_size is 2, the global batch size decreases from 16 to 4

```
context_parallel_size=4
```

**Pattern 5:** Setting save_compressed: true in your configuration enables saving models in a compressed format, which: - Reduces disk space usage by approximately 40% - Maintains compatibility with vLLM for accelerated inference - Maintains compatibility with llmcompressor for further optimization (example: quantization)

```
save_compressed: true
```

**Pattern 6:** Note It is not necessary to place your integration in the integrations folder. It can be in any location, so long as it’s installed in a package in your python env. See this repo for an example: https://github.com/axolotl-ai-cloud/diff-transformer

```
integrations
```

**Pattern 7:** Handle both single-example and batched data. - single example: sample[‘input_ids’] is a list[int] - batched data: sample[‘input_ids’] is a list[list[int]]

```
utils.trainer.drop_long_seq(sample, sequence_len=2048, min_sequence_len=2)
```

### Example Code Patterns

**Example 1** (python):
```python
cli.cloud.modal_.ModalCloud(config, app=None)
```

**Example 2** (python):
```python
cli.cloud.modal_.run_cmd(cmd, run_folder, volumes=None)
```

**Example 3** (python):
```python
core.trainers.base.AxolotlTrainer(
    *_args,
    bench_data_collator=None,
    eval_data_collator=None,
    dataset_tags=None,
    **kwargs,
)
```

**Example 4** (python):
```python
core.trainers.base.AxolotlTrainer.log(logs, start_time=None)
```

**Example 5** (python):
```python
prompt_strategies.input_output.RawInputOutputPrompter()
```

## Reference Files

This skill includes comprehensive documentation in `references/`:

- **api.md** - Api documentation
- **dataset-formats.md** - Dataset-Formats documentation
- **other.md** - Other documentation

Use `view` to read specific reference files when detailed information is needed.

## Working with This Skill

### For Beginners
Start with the getting_started or tutorials reference files for foundational concepts.

### For Specific Features
Use the appropriate category reference file (api, guides, etc.) for detailed information.

### For Code Examples
The quick reference section above contains common patterns extracted from the official docs.

## Resources

### references/
Organized documentation extracted from official sources. These files contain:
- Detailed explanations
- Code examples with language annotations
- Links to original documentation
- Table of contents for quick navigation

### scripts/
Add helper scripts here for common automation tasks.

### assets/
Add templates, boilerplate, or example projects here.

## Notes

- This skill was automatically generated from official documentation
- Reference files preserve the structure and examples from source docs
- Code examples include language detection for better syntax highlighting
- Quick reference patterns are extracted from common usage examples in the docs

## Updating

To refresh this skill with updated documentation:
1. Re-run the scraper with the same configuration
2. The skill will be rebuilt with the latest information


