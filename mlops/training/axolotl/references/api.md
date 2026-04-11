# Axolotl - Api

**Pages:** 150

---

## cli.cloud.modal_

**URL:** https://docs.axolotl.ai/docs/api/cli.cloud.modal_.html

**Contents:**
- cli.cloud.modal_
- Classes
  - ModalCloud
- Functions
  - run_cmd

Modal Cloud support from CLI

Modal Cloud implementation.

Run a command inside a folder, with Modal Volume reloading before and commit on success.

**Examples:**

Example 1 (python):
```python
cli.cloud.modal_.ModalCloud(config, app=None)
```

Example 2 (python):
```python
cli.cloud.modal_.run_cmd(cmd, run_folder, volumes=None)
```

---

## core.trainers.base

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.base.html

**Contents:**
- core.trainers.base
- Classes
  - AxolotlTrainer
    - Methods
      - log
        - Parameters
      - push_to_hub
      - store_metrics
        - Parameters

Module for customized trainers

Extend the base Trainer for axolotl helpers

Log logs on the various objects watching training, including stored metrics.

Overwrite the push_to_hub method in order to force-add the tags when pushing the model on the Hub. Please refer to ~transformers.Trainer.push_to_hub for more details.

Store metrics with specified reduction type.

**Examples:**

Example 1 (python):
```python
core.trainers.base.AxolotlTrainer(
    *_args,
    bench_data_collator=None,
    eval_data_collator=None,
    dataset_tags=None,
    **kwargs,
)
```

Example 2 (python):
```python
core.trainers.base.AxolotlTrainer.log(logs, start_time=None)
```

Example 3 (python):
```python
core.trainers.base.AxolotlTrainer.push_to_hub(*args, **kwargs)
```

Example 4 (python):
```python
core.trainers.base.AxolotlTrainer.store_metrics(
    metrics,
    train_eval='train',
    reduction='mean',
)
```

---

## prompt_strategies.input_output

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.input_output.html

**Contents:**
- prompt_strategies.input_output
- Classes
  - RawInputOutputPrompter
  - RawInputOutputStrategy

prompt_strategies.input_output

Module for plain input/output prompt pairs

prompter for raw i/o data

Prompt Strategy class for input/output pairs

**Examples:**

Example 1 (python):
```python
prompt_strategies.input_output.RawInputOutputPrompter()
```

Example 2 (python):
```python
prompt_strategies.input_output.RawInputOutputStrategy(
    *args,
    eos_token=None,
    **kwargs,
)
```

---

## prompt_strategies.completion

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.completion.html

**Contents:**
- prompt_strategies.completion
- Classes
  - CompletionPromptTokenizingStrategy
  - CompletionPrompter

prompt_strategies.completion

Basic completion text

Tokenizing strategy for Completion prompts.

Prompter for completion

**Examples:**

Example 1 (python):
```python
prompt_strategies.completion.CompletionPromptTokenizingStrategy(
    *args,
    max_length=None,
    **kwargs,
)
```

Example 2 (python):
```python
prompt_strategies.completion.CompletionPrompter()
```

---

## utils.collators.core

**URL:** https://docs.axolotl.ai/docs/api/utils.collators.core.html

**Contents:**
- utils.collators.core

basic shared collator constants

---

## monkeypatch.data.batch_dataset_fetcher

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.data.batch_dataset_fetcher.html

**Contents:**
- monkeypatch.data.batch_dataset_fetcher
- Functions
  - apply_multipack_dataloader_patch
  - patch_fetchers
  - patched_worker_loop
  - remove_multipack_dataloader_patch

monkeypatch.data.batch_dataset_fetcher

Monkey patches for the dataset fetcher to handle batches of packed indexes.

This patch allows DataLoader to correctly process batches that contain multiple bins of packed sequences.

Apply patches to PyTorch’s DataLoader components.

Worker loop that ensures patches are applied in worker processes.

Remove the monkeypatch and restore original PyTorch DataLoader behavior.

**Examples:**

Example 1 (python):
```python
monkeypatch.data.batch_dataset_fetcher.apply_multipack_dataloader_patch()
```

Example 2 (python):
```python
monkeypatch.data.batch_dataset_fetcher.patch_fetchers()
```

Example 3 (python):
```python
monkeypatch.data.batch_dataset_fetcher.patched_worker_loop(*args, **kwargs)
```

Example 4 (python):
```python
monkeypatch.data.batch_dataset_fetcher.remove_multipack_dataloader_patch()
```

---

## core.datasets.chat

**URL:** https://docs.axolotl.ai/docs/api/core.datasets.chat.html

**Contents:**
- core.datasets.chat
- Classes
  - TokenizedChatDataset

Tokenized chat dataset

**Examples:**

Example 1 (python):
```python
core.datasets.chat.TokenizedChatDataset(
    data,
    model_transform,
    *args,
    message_transform=None,
    formatter=None,
    process_count=None,
    keep_in_memory=False,
    **kwargs,
)
```

---

## utils.freeze

**URL:** https://docs.axolotl.ai/docs/api/utils.freeze.html

**Contents:**
- utils.freeze
- Classes
  - LayerNamePattern
    - Methods
      - match
- Functions
  - freeze_layers_except

module to freeze/unfreeze parameters by name

Represents a regex pattern for layer names, potentially including a parameter index range.

Checks if the given layer name matches the regex pattern.

Parameters: - name (str): The layer name to check.

Returns: - bool: True if the layer name matches the pattern, False otherwise.

Freezes all layers of the given model except for the layers that match given regex patterns. Periods in the patterns are treated as literal periods, not as wildcard characters.

Parameters: - model (nn.Module): The PyTorch model to be modified. - regex_patterns (list of str): List of regex patterns to match layer names to keep unfrozen. Note that you cannot use a dot as a wildcard character in the patterns since it is reserved for separating layer names. Also, to match the entire layer name, the pattern should start with “^” and end with “\(", otherwise it will match any part of the layer name. The range pattern part is optional and it is not compiled as a regex pattern which means you must put "\)” before the range pattern if you want to match the entire layer name. E.g., [“^model.embed_tokens.weight\([:32000]", "layers.2[0-9]+.block_sparse_moe.gate.[a-z]+\)”]

Returns: None; the model is modified in place.

**Examples:**

Example 1 (python):
```python
utils.freeze.LayerNamePattern(pattern)
```

Example 2 (python):
```python
utils.freeze.LayerNamePattern.match(name)
```

Example 3 (python):
```python
utils.freeze.freeze_layers_except(model, regex_patterns)
```

---

## monkeypatch.unsloth_

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.unsloth_.html

**Contents:**
- monkeypatch.unsloth_

module for patching with unsloth optimizations

---

## utils.schemas.datasets

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.datasets.html

**Contents:**
- utils.schemas.datasets
- Classes
  - DPODataset
  - KTODataset
  - PretrainingDataset
  - SFTDataset
    - Methods
      - handle_legacy_message_fields
  - StepwiseSupervisedDataset
  - UserDefinedDPOType

utils.schemas.datasets

Pydantic models for datasets-related configuration

DPO configuration subset

KTO configuration subset

Pretraining dataset configuration subset

SFT configuration subset

Handle backwards compatibility between legacy message field mapping and new property mapping system.

Stepwise supervised dataset configuration subset

User defined typing for DPO

User defined typing for KTO

Structure for user defined prompt types

**Examples:**

Example 1 (python):
```python
utils.schemas.datasets.DPODataset()
```

Example 2 (python):
```python
utils.schemas.datasets.KTODataset()
```

Example 3 (python):
```python
utils.schemas.datasets.PretrainingDataset()
```

Example 4 (python):
```python
utils.schemas.datasets.SFTDataset()
```

---

## core.chat.format.llama3x

**URL:** https://docs.axolotl.ai/docs/api/core.chat.format.llama3x.html

**Contents:**
- core.chat.format.llama3x

core.chat.format.llama3x

Llama 3.x chat formatting functions for MessageContents

---

## datasets

**URL:** https://docs.axolotl.ai/docs/api/datasets.html

**Contents:**
- datasets
- Classes
  - TokenizedPromptDataset
    - Parameters

Module containing dataset functionality.

We want this to be a wrapper for an existing dataset that we have loaded. Lets use the concept of middlewares to wrap each dataset. We’ll use the collators later on to pad the datasets.

Dataset that returns tokenized prompts from a stream of text files.

**Examples:**

Example 1 (python):
```python
datasets.TokenizedPromptDataset(
    prompt_tokenizer,
    dataset,
    process_count=None,
    keep_in_memory=False,
    **kwargs,
)
```

---

## prompt_strategies.bradley_terry.llama3

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.bradley_terry.llama3.html

**Contents:**
- prompt_strategies.bradley_terry.llama3
- Functions
  - icr

prompt_strategies.bradley_terry.llama3

chatml transforms for datasets with system, input, chosen, rejected to match llama3 chat template

chatml transforms for datasets with system, input, chosen, rejected ex. https://huggingface.co/datasets/argilla/distilabel-intel-orca-dpo-pairs

**Examples:**

Example 1 (python):
```python
prompt_strategies.bradley_terry.llama3.icr(cfg, **kwargs)
```

---

## common.datasets

**URL:** https://docs.axolotl.ai/docs/api/common.datasets.html

**Contents:**
- common.datasets
- Classes
  - TrainDatasetMeta
- Functions
  - load_datasets
    - Parameters
    - Returns
  - load_preference_datasets
    - Parameters
    - Returns

Dataset loading utilities.

Dataclass with fields for training and validation datasets and metadata.

Loads one or more training or evaluation datasets, calling axolotl.utils.data.prepare_datasets. Optionally, logs out debug information.

Loads one or more training or evaluation datasets for RL training using paired preference data, calling axolotl.utils.data.rl.prepare_preference_datasets. Optionally, logs out debug information.

Randomly sample num_samples samples with replacement from dataset.

**Examples:**

Example 1 (python):
```python
common.datasets.TrainDatasetMeta(
    train_dataset,
    eval_dataset=None,
    total_num_steps=None,
)
```

Example 2 (python):
```python
common.datasets.load_datasets(cfg, cli_args=None, debug=False)
```

Example 3 (python):
```python
common.datasets.load_preference_datasets(cfg, cli_args=None)
```

Example 4 (python):
```python
common.datasets.sample_dataset(dataset, num_samples)
```

---

## cli.train

**URL:** https://docs.axolotl.ai/docs/api/cli.train.html

**Contents:**
- cli.train
- Functions
  - do_cli
    - Parameters
  - do_train
    - Parameters

CLI to run training on a model.

Parses axolotl config, CLI args, and calls do_train.

Trains a transformers model by first loading the dataset(s) specified in the axolotl config, and then calling axolotl.train.train. Also runs the plugin manager’s post_train_unload once training completes.

**Examples:**

Example 1 (python):
```python
cli.train.do_cli(config=Path('examples/'), **kwargs)
```

Example 2 (python):
```python
cli.train.do_train(cfg, cli_args)
```

---

## cli.utils.fetch

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.fetch.html

**Contents:**
- cli.utils.fetch
- Functions
  - fetch_from_github
    - Parameters

Utilities for axolotl fetch CLI command.

Sync files from a specific directory in the GitHub repository. Only downloads files that don’t exist locally or have changed.

**Examples:**

Example 1 (python):
```python
cli.utils.fetch.fetch_from_github(dir_prefix, dest_dir=None, max_workers=5)
```

---

## utils.tokenization

**URL:** https://docs.axolotl.ai/docs/api/utils.tokenization.html

**Contents:**
- utils.tokenization
- Functions
  - color_token_for_rl_debug
  - process_tokens_for_rl_debug

Module for tokenization utilities

Helper function to color tokens based on their type.

Helper function to process and color tokens.

**Examples:**

Example 1 (python):
```python
utils.tokenization.color_token_for_rl_debug(
    decoded_token,
    encoded_token,
    color,
    text_only,
)
```

Example 2 (python):
```python
utils.tokenization.process_tokens_for_rl_debug(
    tokens,
    color,
    tokenizer,
    text_only,
)
```

---

## core.trainers.grpo.sampler

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.grpo.sampler.html

**Contents:**
- core.trainers.grpo.sampler
- Classes
  - SequenceParallelRepeatRandomSampler
    - Parameters
    - Methods
      - set_epoch
        - Parameters

core.trainers.grpo.sampler

Repeat random sampler (similar to the one implemented in https://github.com/huggingface/trl/blob/main/trl/trainer/grpo_trainer.py) that adds sequence parallelism functionality; i.e., duplicating data across ranks in the same sequence parallel group.

Sampler for GRPO training with sequence parallelism.

This sampler ensures: - Ranks in the same sequence parallel (SP) group receive identical data. - Each index is repeated multiple times for sampling different completions. - Entire batches are repeated for reuse in multiple updates. - Data is properly distributed across SP groups.

In the table below, the values represent dataset indices. Each SP group has context_parallel_size = 2 GPUs working together on the same data. There are 2 SP groups (SP0 and SP1), with world_size = 4 total GPUs.

grad_accum=2 ▲ ▲ 0 0 [0 0 0 1 1 1] [2 2 2 3 3 3] <- SP groups get different data ▼ | 0 1 [0 0 0 1 1 1] [2 2 2 3 3 3] <- Same data for each SP group GPU | | 1 2 [0 0 0 1 1 1] [2 2 2 3 3 3] <- Repeat same indices for iterations num_iterations=2 ▼ 1 3 [0 0 0 1 1 1] [2 2 2 3 3 3] <- When using gradient accumulation

Sets the epoch for this sampler.

**Examples:**

Example 1 (python):
```python
core.trainers.grpo.sampler.SequenceParallelRepeatRandomSampler(
    dataset,
    mini_repeat_count,
    world_size,
    rank,
    batch_size=1,
    repeat_count=1,
    context_parallel_size=1,
    shuffle=True,
    seed=0,
    drop_last=False,
)
```

Example 2 (unknown):
```unknown
Sequence Parallel Groups
                                |       SP0        |       SP1        |
                                |  GPU 0  |  GPU 1 |  GPU 2  |  GPU 3 |
            global_step  step    <---> mini_repeat_count=3
                                    <----------> batch_size=2 per SP group
```

Example 3 (unknown):
```unknown
2       4         [4 4 4  5 5 5]     [6 6 6  7 7 7]   <- New batch of data indices
                 2       5         [4 4 4  5 5 5]     [6 6 6  7 7 7]
                                    ...
```

Example 4 (python):
```python
core.trainers.grpo.sampler.SequenceParallelRepeatRandomSampler.set_epoch(epoch)
```

---

## evaluate

**URL:** https://docs.axolotl.ai/docs/api/evaluate.html

**Contents:**
- evaluate
- Functions
  - evaluate
    - Parameters
    - Returns
  - evaluate_dataset
    - Parameters
    - Returns

Module for evaluating models.

Evaluate a model on training and validation datasets.

Helper function to evaluate a single dataset.

**Examples:**

Example 1 (python):
```python
evaluate.evaluate(cfg, dataset_meta)
```

Example 2 (python):
```python
evaluate.evaluate_dataset(trainer, dataset, dataset_type, flash_optimum=False)
```

---

## utils.optimizers.adopt

**URL:** https://docs.axolotl.ai/docs/api/utils.optimizers.adopt.html

**Contents:**
- utils.optimizers.adopt
- Functions
  - adopt

utils.optimizers.adopt

Copied from https://github.com/iShohei220/adopt

ADOPT: Modified Adam Can Converge with Any β2 with the Optimal Rate (2024) Taniguchi, Shohei and Harada, Keno and Minegishi, Gouki and Oshima, Yuta and Jeong, Seong Cheol and Nagahara, Go and Iiyama, Tomoshi and Suzuki, Masahiro and Iwasawa, Yusuke and Matsuo, Yutaka

Functional API that performs ADOPT algorithm computation.

**Examples:**

Example 1 (python):
```python
utils.optimizers.adopt.adopt(
    params,
    grads,
    exp_avgs,
    exp_avg_sqs,
    state_steps,
    foreach=None,
    capturable=False,
    differentiable=False,
    fused=None,
    grad_scale=None,
    found_inf=None,
    has_complex=False,
    *,
    beta1,
    beta2,
    lr,
    clip_lambda,
    weight_decay,
    decouple,
    eps,
    maximize,
)
```

---

## prompt_tokenizers

**URL:** https://docs.axolotl.ai/docs/api/prompt_tokenizers.html

**Contents:**
- prompt_tokenizers
- Classes
  - AlpacaMultipleChoicePromptTokenizingStrategy
  - AlpacaPromptTokenizingStrategy
  - AlpacaReflectionPTStrategy
  - DatasetWrappingStrategy
  - GPTeacherPromptTokenizingStrategy
  - InstructionPromptTokenizingStrategy
  - InvalidDataException
  - JeopardyPromptTokenizingStrategy

Module containing PromptTokenizingStrategy and Prompter classes

Tokenizing strategy for Alpaca Multiple Choice prompts.

Tokenizing strategy for Alpaca prompts.

Tokenizing strategy for Alpaca Reflection prompts.

Abstract class for wrapping datasets for Chat Messages

Tokenizing strategy for GPTeacher prompts.

Tokenizing strategy for instruction-based prompts.

Exception raised when the data is invalid

Tokenizing strategy for Jeopardy prompts.

Tokenizing strategy for NomicGPT4All prompts.

Tokenizing strategy for OpenAssistant prompts.

Abstract class for tokenizing strategies

Tokenizing strategy for Reflection prompts.

Tokenizing strategy for SummarizeTLDR prompts.

Parses the tokenized prompt and append the tokenized input_ids, attention_mask and labels to the result

Returns the default values for the tokenize prompt function

**Examples:**

Example 1 (python):
```python
prompt_tokenizers.AlpacaMultipleChoicePromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 2 (python):
```python
prompt_tokenizers.AlpacaPromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 3 (python):
```python
prompt_tokenizers.AlpacaReflectionPTStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 4 (python):
```python
prompt_tokenizers.DatasetWrappingStrategy()
```

---

## cli.art

**URL:** https://docs.axolotl.ai/docs/api/cli.art.html

**Contents:**
- cli.art
- Functions
  - print_axolotl_text_art

Axolotl ASCII logo utils.

Prints axolotl ASCII art.

**Examples:**

Example 1 (python):
```python
cli.art.print_axolotl_text_art()
```

---

## utils.callbacks.perplexity

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.perplexity.html

**Contents:**
- utils.callbacks.perplexity
- Classes
  - Perplexity
    - Methods
      - compute

utils.callbacks.perplexity

callback to calculate perplexity as an evaluation metric.

Calculate perplexity as defined in https://huggingface.co/docs/transformers/en/perplexity. This is a custom variant that doesn’t re-tokenize the input or re-load the model.

Compute perplexity in a fixed length sliding window across the sequence.

**Examples:**

Example 1 (python):
```python
utils.callbacks.perplexity.Perplexity(tokenizer, max_seq_len, stride=512)
```

Example 2 (python):
```python
utils.callbacks.perplexity.Perplexity.compute(model, references=None)
```

---

## cli.utils.train

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.train.html

**Contents:**
- cli.utils.train
- Functions
  - build_command
    - Parameters
    - Returns
  - generate_config_files
    - Parameters
  - launch_training

Utilities for axolotl train CLI command.

Build command list from base command and options.

Generate list of configuration files to process. Yields a tuple of the configuration file name and a boolean indicating whether this is a group of configurations (i.e., a sweep).

Execute training with the given configuration.

**Examples:**

Example 1 (python):
```python
cli.utils.train.build_command(base_cmd, options)
```

Example 2 (python):
```python
cli.utils.train.generate_config_files(config, sweep)
```

Example 3 (python):
```python
cli.utils.train.launch_training(
    cfg_file,
    launcher,
    cloud,
    kwargs,
    launcher_args=None,
    use_exec=False,
)
```

---

## cli.vllm_serve

**URL:** https://docs.axolotl.ai/docs/api/cli.vllm_serve.html

**Contents:**
- cli.vllm_serve
- Classes
  - AxolotlScriptArguments
- Functions
  - do_vllm_serve
    - Returns

CLI to start the vllm server for online RL

Additional arguments for the VLLM server

Starts the VLLM server for serving LLM models used for online RL

Args :param cfg: Parsed doct of the YAML config :param cli_args: dict of additional command-line arguments of type VllmServeCliArgs

**Examples:**

Example 1 (python):
```python
cli.vllm_serve.AxolotlScriptArguments(
    reasoning_parser='',
    enable_reasoning=None,
)
```

Example 2 (python):
```python
cli.vllm_serve.do_vllm_serve(config, cli_args)
```

---

## convert

**URL:** https://docs.axolotl.ai/docs/api/convert.html

**Contents:**
- convert
- Classes
  - FileReader
  - FileWriter
  - JsonParser
  - JsonToJsonlConverter
  - JsonlSerializer
  - StdoutWriter

Module containing File Reader, File Writer, Json Parser, and Jsonl Serializer classes

Reads a file and returns its contents as a string

Writes a string to a file

Parses a string as JSON and returns the result

Converts a JSON file to JSONL

Serializes a list of JSON objects into a JSONL string

Writes a string to stdout

**Examples:**

Example 1 (python):
```python
convert.FileReader()
```

Example 2 (python):
```python
convert.FileWriter(file_path)
```

Example 3 (python):
```python
convert.JsonParser()
```

Example 4 (python):
```python
convert.JsonToJsonlConverter(
    file_reader,
    file_writer,
    json_parser,
    jsonl_serializer,
)
```

---

## monkeypatch.utils

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.utils.html

**Contents:**
- monkeypatch.utils
- Functions
  - get_cu_seqlens
  - get_cu_seqlens_from_pos_ids
  - mask_2d_to_4d

Shared utils for the monkeypatches

generate a cumulative sequence length mask for flash attention using attn mask

generate a cumulative sequence length mask for flash attention using pos ids

Expands attention_mask from [bsz, seq_len] to [bsz, 1, tgt_seq_len, src_seq_len]. This expansion handles packed sequences so that sequences share the same attention mask integer value when they attend to each other within that sequence. This expansion transforms the mask to lower triangular form to prevent future peeking.

**Examples:**

Example 1 (python):
```python
monkeypatch.utils.get_cu_seqlens(attn_mask)
```

Example 2 (python):
```python
monkeypatch.utils.get_cu_seqlens_from_pos_ids(position_ids)
```

Example 3 (python):
```python
monkeypatch.utils.mask_2d_to_4d(mask, dtype, tgt_len=None)
```

---

## prompt_strategies.pygmalion

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.pygmalion.html

**Contents:**
- prompt_strategies.pygmalion
- Classes
  - PygmalionPromptTokenizingStrategy
  - PygmalionPrompter

prompt_strategies.pygmalion

Module containing the PygmalionPromptTokenizingStrategy and PygmalionPrompter class

Tokenizing strategy for Pygmalion.

Prompter for Pygmalion.

**Examples:**

Example 1 (python):
```python
prompt_strategies.pygmalion.PygmalionPromptTokenizingStrategy(
    prompter,
    tokenizer,
    *args,
    **kwargs,
)
```

Example 2 (python):
```python
prompt_strategies.pygmalion.PygmalionPrompter(*args, **kwargs)
```

---

## utils.callbacks.mlflow_

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.mlflow_.html

**Contents:**
- utils.callbacks.mlflow_
- Classes
  - SaveAxolotlConfigtoMlflowCallback

utils.callbacks.mlflow_

MLFlow module for trainer callbacks

Callback to save axolotl config to mlflow

**Examples:**

Example 1 (python):
```python
utils.callbacks.mlflow_.SaveAxolotlConfigtoMlflowCallback(axolotl_config_path)
```

---

## loaders.adapter

**URL:** https://docs.axolotl.ai/docs/api/loaders.adapter.html

**Contents:**
- loaders.adapter
- Functions
  - setup_quantized_meta_for_peft
  - setup_quantized_peft_meta_for_training

Adapter loading functionality, including LoRA / QLoRA and associated utils

Replaces quant_state.to with a dummy function to prevent PEFT from moving quant_state to meta device

Replaces dummy quant_state.to method with the original function to allow training to continue

**Examples:**

Example 1 (python):
```python
loaders.adapter.setup_quantized_meta_for_peft(model)
```

Example 2 (python):
```python
loaders.adapter.setup_quantized_peft_meta_for_training(model)
```

---

## cli.cloud.base

**URL:** https://docs.axolotl.ai/docs/api/cli.cloud.base.html

**Contents:**
- cli.cloud.base
- Classes
  - Cloud

base class for cloud platforms from cli

Abstract base class for cloud platforms.

**Examples:**

Example 1 (python):
```python
cli.cloud.base.Cloud()
```

---

## monkeypatch.llama_attn_hijack_flash

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.llama_attn_hijack_flash.html

**Contents:**
- monkeypatch.llama_attn_hijack_flash
- Functions
  - flashattn_forward_with_s2attn

monkeypatch.llama_attn_hijack_flash

Flash attention monkey patch for llama model

Input shape: Batch x Time x Channel

From: https://github.com/dvlab-research/LongLoRA/blob/main/llama_attn_replace.py

attention_mask: [bsz, q_len]

cu_seqlens will be ignored if provided max_seqlen will be ignored if provided

**Examples:**

Example 1 (python):
```python
monkeypatch.llama_attn_hijack_flash.flashattn_forward_with_s2attn(
    self,
    hidden_states,
    attention_mask=None,
    position_ids=None,
    past_key_value=None,
    output_attentions=False,
    use_cache=False,
    padding_mask=None,
    cu_seqlens=None,
    max_seqlen=None,
)
```

---

## monkeypatch.llama_patch_multipack

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.llama_patch_multipack.html

**Contents:**
- monkeypatch.llama_patch_multipack

monkeypatch.llama_patch_multipack

Patched LlamaAttention to use torch.nn.functional.scaled_dot_product_attention

---

## cli.inference

**URL:** https://docs.axolotl.ai/docs/api/cli.inference.html

**Contents:**
- cli.inference
- Functions
  - do_cli
    - Parameters
  - do_inference
    - Parameters
  - do_inference_gradio
    - Parameters
  - get_multi_line_input
    - Returns

CLI to run inference on a trained model.

Parses axolotl config, CLI args, and calls do_inference or do_inference_gradio.

Runs inference on the command line in a loop. User input is accepted, a chat template is (optionally) applied, and the model specified in the axolotl config is used to generate completions according to a default generation config.

Runs inference in a Gradio interface. User input is accepted, a chat template is (optionally) applied, and the model specified in the axolotl config is used to generate completions according to a default generation config.

Gets multi-line input from terminal.

**Examples:**

Example 1 (python):
```python
cli.inference.do_cli(config=Path('examples/'), gradio=False, **kwargs)
```

Example 2 (python):
```python
cli.inference.do_inference(cfg, cli_args)
```

Example 3 (python):
```python
cli.inference.do_inference_gradio(cfg, cli_args)
```

Example 4 (python):
```python
cli.inference.get_multi_line_input()
```

---

## loaders.tokenizer

**URL:** https://docs.axolotl.ai/docs/api/loaders.tokenizer.html

**Contents:**
- loaders.tokenizer
- Functions
  - load_tokenizer
  - modify_tokenizer_files
    - Parameters
    - Returns

Tokenizer loading functionality and associated utils

Load and configure the tokenizer based on the provided config.

Modify tokenizer files to replace added_tokens strings, save to output directory, and return the path to the modified tokenizer.

This only works with reserved tokens that were added to the tokenizer, not tokens already part of the vocab.

Ref: https://github.com/huggingface/transformers/issues/27974#issuecomment-1854188941

**Examples:**

Example 1 (python):
```python
loaders.tokenizer.load_tokenizer(cfg)
```

Example 2 (python):
```python
loaders.tokenizer.modify_tokenizer_files(
    tokenizer_path,
    token_mappings,
    output_dir,
)
```

---

## cli.utils.sweeps

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.sweeps.html

**Contents:**
- cli.utils.sweeps
- Functions
  - generate_sweep_configs
    - Parameters
    - Returns
    - Example

Utilities for handling sweeps over configs for axolotl train CLI command

Recursively generates all possible configurations by applying sweeps to the base config.

sweeps_config = { ‘learning_rate’: [0.1, 0.01], ’_’: [ {‘load_in_8bit’: True, ‘adapter’: ‘lora’}, {‘load_in_4bit’: True, ‘adapter’: ‘qlora’} ] }

**Examples:**

Example 1 (python):
```python
cli.utils.sweeps.generate_sweep_configs(base_config, sweeps_config)
```

---

## prompt_strategies.dpo.chatml

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.chatml.html

**Contents:**
- prompt_strategies.dpo.chatml
- Functions
  - argilla_chat
  - icr
  - intel
  - ultra

prompt_strategies.dpo.chatml

DPO strategies for chatml

for argilla/dpo-mix-7k conversations

chatml transforms for datasets with system, input, chosen, rejected ex. https://huggingface.co/datasets/argilla/distilabel-intel-orca-dpo-pairs

For Intel Orca DPO Pairs

for ultrafeedback binarized conversations

**Examples:**

Example 1 (python):
```python
prompt_strategies.dpo.chatml.argilla_chat(cfg, **kwargs)
```

Example 2 (python):
```python
prompt_strategies.dpo.chatml.icr(cfg, **kwargs)
```

Example 3 (python):
```python
prompt_strategies.dpo.chatml.intel(cfg, **kwargs)
```

Example 4 (python):
```python
prompt_strategies.dpo.chatml.ultra(cfg, **kwargs)
```

---

## cli.quantize

**URL:** https://docs.axolotl.ai/docs/api/cli.quantize.html

**Contents:**
- cli.quantize
- Functions
  - do_quantize
    - Parameters

CLI to post-training quantize a model using torchao

Quantizes a model’s model’s weights

**Examples:**

Example 1 (python):
```python
cli.quantize.do_quantize(config, cli_args)
```

---

## utils.dict

**URL:** https://docs.axolotl.ai/docs/api/utils.dict.html

**Contents:**
- utils.dict
- Classes
  - DictDefault
- Functions
  - remove_none_values

Module containing the DictDefault class

A Dict that returns None instead of returning empty Dict for missing keys.

Remove null from a dictionary-like obj or list. These can appear due to Dataset loading causing schema merge. See https://github.com/axolotl-ai-cloud/axolotl/pull/2909

**Examples:**

Example 1 (python):
```python
utils.dict.DictDefault()
```

Example 2 (python):
```python
utils.dict.remove_none_values(obj)
```

---

## API Reference

**URL:** https://docs.axolotl.ai/docs/api/

**Contents:**
- API Reference
- Core
- CLI
- Trainers
- Model Loading
- Mixins
- Context Managers
- Prompt Strategies
- Kernels
- Monkey Patches

Core functionality for training

Command-line interface

Training implementations

Functionality for loading and patching models, tokenizers, etc.

Mixin classes for augmenting trainers

Context managers for altering trainer behaviors

Prompt formatting strategies

Low-level performance optimizations

Runtime patches for model optimizations

Pydantic data models for Axolotl config

Third-party integrations and extensions

Common utilities and shared functionality

Custom model implementations

Data processing utilities

---

## monkeypatch.lora_kernels

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.lora_kernels.html

**Contents:**
- monkeypatch.lora_kernels
- Classes
  - FakeMLP
- Functions
  - apply_lora_kernel_patches
    - Parameters
    - Returns
    - Raises
    - Note
  - get_attention_cls_from_config

monkeypatch.lora_kernels

Module for patching custom LoRA Triton kernels and torch.autograd functions.

placeholder MLP for triton patching

Applies optimized Triton kernel patches to a PEFT model.

Patches a PEFT model with optimized implementations for MLP and attention computations. The optimizations include custom Triton kernels for activation functions and specialized autograd functions for LoRA computations.

The optimizations require LoRA adapters with no dropout and no bias terms. The function will skip patching if these conditions aren’t met.

Get the appropriate attention class by inspecting the model config. Uses dynamic import to support any model architecture that follows the standard transformers naming convention.

Get the layers of the model. Handles text-only and multimodal models.

Original implementation of output projection without optimizations.

Original implementation of QKV projection without optimizations.

Given an axolotl config, this method patches the inferred attention class forward pass with optimized LoRA implementations.

It modifies the attention class to use optimized QKV and output projections. The original implementation is preserved and can be restored if needed.

**Examples:**

Example 1 (python):
```python
monkeypatch.lora_kernels.FakeMLP(gate_proj, up_proj, down_proj)
```

Example 2 (python):
```python
monkeypatch.lora_kernels.apply_lora_kernel_patches(model, cfg)
```

Example 3 (python):
```python
monkeypatch.lora_kernels.get_attention_cls_from_config(cfg)
```

Example 4 (python):
```python
monkeypatch.lora_kernels.get_layers(model)
```

---

## monkeypatch.stablelm_attn_hijack_flash

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.stablelm_attn_hijack_flash.html

**Contents:**
- monkeypatch.stablelm_attn_hijack_flash
- Functions
  - repeat_kv
  - rotate_half

monkeypatch.stablelm_attn_hijack_flash

PyTorch StableLM Epoch model.

This is the equivalent of torch.repeat_interleave(x, dim=1, repeats=n_rep). The hidden states go from (batch, num_key_value_heads, seqlen, head_dim) to (batch, num_attention_heads, seqlen, head_dim)

Rotates half the hidden dims of the input.

**Examples:**

Example 1 (python):
```python
monkeypatch.stablelm_attn_hijack_flash.repeat_kv(hidden_states, n_rep)
```

Example 2 (python):
```python
monkeypatch.stablelm_attn_hijack_flash.rotate_half(x)
```

---

## core.trainers.mixins.rng_state_loader

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.mixins.rng_state_loader.html

**Contents:**
- core.trainers.mixins.rng_state_loader
- Classes
  - RngLoaderMixin

core.trainers.mixins.rng_state_loader

Temporary fix/override for bug in resume from checkpoint

See https://github.com/huggingface/transformers/pull/37162

TODO: Remove when upstream added PR to release

mixin for method override to load RNG states from a checkpoint

**Examples:**

Example 1 (python):
```python
core.trainers.mixins.rng_state_loader.RngLoaderMixin()
```

---

## core.trainers.utils

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.utils.html

**Contents:**
- core.trainers.utils

Utils for Axolotl trainers

---

## core.training_args

**URL:** https://docs.axolotl.ai/docs/api/core.training_args.html

**Contents:**
- core.training_args
- Classes
  - AxolotlCPOConfig
  - AxolotlKTOConfig
  - AxolotlORPOConfig
  - AxolotlPRMConfig
  - AxolotlRewardConfig
  - AxolotlTrainingArguments

extra axolotl specific training args

CPO config for CPO training

KTO config for KTO training

ORPO config for ORPO training

PRM config for PRM training

Reward config for Reward training

Training arguments for Causal trainer

This code is duplicated due to HF TrainingArguments not setting output_dir with a default value so it can’t be used as a mixin.

**Examples:**

Example 1 (python):
```python
core.training_args.AxolotlCPOConfig(simpo_gamma=None)
```

Example 2 (python):
```python
core.training_args.AxolotlKTOConfig()
```

Example 3 (python):
```python
core.training_args.AxolotlORPOConfig()
```

Example 4 (python):
```python
core.training_args.AxolotlPRMConfig()
```

---

## monkeypatch.btlm_attn_hijack_flash

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.btlm_attn_hijack_flash.html

**Contents:**
- monkeypatch.btlm_attn_hijack_flash

monkeypatch.btlm_attn_hijack_flash

Flash attention monkey patch for cerebras btlm model

---

## prompt_strategies.dpo.passthrough

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.passthrough.html

**Contents:**
- prompt_strategies.dpo.passthrough

prompt_strategies.dpo.passthrough

DPO prompt strategies passthrough/zero-processing strategy

---

## kernels.swiglu

**URL:** https://docs.axolotl.ai/docs/api/kernels.swiglu.html

**Contents:**
- kernels.swiglu
- Functions
  - swiglu_backward
    - Parameters
    - Returns
  - swiglu_forward
    - Parameters
    - Returns

Module for definition of SwiGLU Triton kernels.

See “GLU Variants Improve Transformer” (https://arxiv.org/abs/2002.05202).

Credit to unsloth (https://unsloth.ai/) for inspiration for this implementation.

SwiGLU backward pass using in-place operations.

SwiGLU forward pass. Computes SwiGLU activation: x * sigmoid(x) * up, where x is the gate tensor.

**Examples:**

Example 1 (python):
```python
kernels.swiglu.swiglu_backward(grad_output, gate, up)
```

Example 2 (python):
```python
kernels.swiglu.swiglu_forward(gate, up)
```

---

## core.trainers.grpo.trainer

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.grpo.trainer.html

**Contents:**
- core.trainers.grpo.trainer
- Classes
  - AxolotlGRPOSequenceParallelTrainer
    - Methods
      - get_train_dataloader
  - AxolotlGRPOTrainer

core.trainers.grpo.trainer

Axolotl GRPO trainers (with and without sequence parallelism handling)

Extend the base GRPOTrainer for sequence parallelism handling

Get dataloader for training

Extend the base GRPOTrainer for axolotl helpers

**Examples:**

Example 1 (python):
```python
core.trainers.grpo.trainer.AxolotlGRPOSequenceParallelTrainer(
    model,
    reward_funcs,
    args=None,
    train_dataset=None,
    eval_dataset=None,
    processing_class=None,
    reward_processing_classes=None,
    callbacks=None,
    optimizers=(None, None),
    peft_config=None,
    optimizer_cls_and_kwargs=None,
)
```

Example 2 (python):
```python
core.trainers.grpo.trainer.AxolotlGRPOSequenceParallelTrainer.get_train_dataloader(
)
```

Example 3 (python):
```python
core.trainers.grpo.trainer.AxolotlGRPOTrainer(*args, **kwargs)
```

---

## prompt_strategies.user_defined

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.user_defined.html

**Contents:**
- prompt_strategies.user_defined
- Classes
  - UserDefinedDatasetConfig
  - UserDefinedPromptTokenizationStrategy

prompt_strategies.user_defined

User Defined prompts with configuration from the YML config

dataclass configuration representing a userdefined dataset type

Prompt Tokenization Strategy for user defined prompts

**Examples:**

Example 1 (python):
```python
prompt_strategies.user_defined.UserDefinedDatasetConfig(
    system_prompt='',
    field_system='system',
    field_instruction='instruction',
    field_input='input',
    field_output='output',
    format='{instruction} {input} ',
    no_input_format='{instruction} ',
    system_format='{system}',
)
```

Example 2 (python):
```python
prompt_strategies.user_defined.UserDefinedPromptTokenizationStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

---

## utils.schemas.training

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.training.html

**Contents:**
- utils.schemas.training
- Classes
  - HyperparametersConfig
  - JaggedLRConfig
  - LrGroup

utils.schemas.training

Pydantic models for training hyperparameters

Training hyperparams configuration subset

JaggedLR configuration subset, can be used w/ ReLoRA training

Custom learning rate group configuration

**Examples:**

Example 1 (python):
```python
utils.schemas.training.HyperparametersConfig()
```

Example 2 (python):
```python
utils.schemas.training.JaggedLRConfig()
```

Example 3 (python):
```python
utils.schemas.training.LrGroup()
```

---

## utils.quantization

**URL:** https://docs.axolotl.ai/docs/api/utils.quantization.html

**Contents:**
- utils.quantization
- Functions
  - convert_qat_model
  - get_quantization_config
    - Parameters
    - Returns
    - Raises
  - prepare_model_for_qat
    - Parameters
    - Raises

Utilities for quantization including QAT and PTQ using torchao.

This function converts a QAT model which has fake quantized layers back to the original model.

This function is used to build a post-training quantization config.

This function is used to prepare a model for QAT by swapping the model’s linear layers with fake quantized linear layers, and optionally the embedding weights with fake quantized embedding weights.

This function is used to quantize a model.

**Examples:**

Example 1 (python):
```python
utils.quantization.convert_qat_model(model, quantize_embedding=False)
```

Example 2 (python):
```python
utils.quantization.get_quantization_config(
    weight_dtype,
    activation_dtype=None,
    group_size=None,
)
```

Example 3 (python):
```python
utils.quantization.prepare_model_for_qat(
    model,
    weight_dtype,
    group_size=None,
    activation_dtype=None,
    quantize_embedding=False,
)
```

Example 4 (python):
```python
utils.quantization.quantize_model(
    model,
    weight_dtype,
    group_size=None,
    activation_dtype=None,
    quantize_embedding=None,
)
```

---

## logging_config

**URL:** https://docs.axolotl.ai/docs/api/logging_config.html

**Contents:**
- logging_config
- Classes
  - AxolotlLogger
  - AxolotlOrWarnErrorFilter
  - ColorfulFormatter
- Functions
  - configure_logging

Common logging module for axolotl.

Logger that applies filtering to non-axolotl loggers.

Allows ANY WARNING or higher (unless overridden by LOG_LEVEL). Allows axolotl.* at INFO or higher (unless overridden by AXOLOTL_LOG_LEVEL). Drops all other records (i.e. non-axolotl.INFO, DEBUG, etc. by default).

Formatter to add coloring to log messages by log type

Configure with default logging

**Examples:**

Example 1 (python):
```python
logging_config.AxolotlLogger(name, level=logging.NOTSET)
```

Example 2 (python):
```python
logging_config.AxolotlOrWarnErrorFilter(**kwargs)
```

Example 3 (python):
```python
logging_config.ColorfulFormatter()
```

Example 4 (python):
```python
logging_config.configure_logging()
```

---

## prompt_strategies.stepwise_supervised

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.stepwise_supervised.html

**Contents:**
- prompt_strategies.stepwise_supervised
- Classes
  - StepwiseSupervisedPromptTokenizingStrategy

prompt_strategies.stepwise_supervised

Module for stepwise datasets, typically including a prompt and reasoning traces, and (optionally) per-step, or per-prompt-trace labels for reward modelling.

Tokenizing strategy for supervised stepwise datasets, typically used for COT-reasoning. These datasets should include the following columns: - prompt: the prompt text - completions: a list of n completion steps - labels: a list of n labels indicating the “correctness” of each step

**Examples:**

Example 1 (python):
```python
prompt_strategies.stepwise_supervised.StepwiseSupervisedPromptTokenizingStrategy(
    tokenizer,
    sequence_len=2048,
    step_separator='\n',
    max_completion_length=None,
    train_on_last_step_only=False,
)
```

---

## utils.schemas.model

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.model.html

**Contents:**
- utils.schemas.model
- Classes
  - ModelInputConfig
  - ModelOutputConfig
  - SpecialTokensConfig

Pydantic models for model input / output, etc. configuration

Model configuration subset

model save configuration subset

Special tokens configuration subset

**Examples:**

Example 1 (python):
```python
utils.schemas.model.ModelInputConfig()
```

Example 2 (python):
```python
utils.schemas.model.ModelOutputConfig()
```

Example 3 (python):
```python
utils.schemas.model.SpecialTokensConfig()
```

---

## utils.schemas.enums

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.enums.html

**Contents:**
- utils.schemas.enums
- Classes
  - ChatTemplate
  - CustomSupportedOptimizers
  - RLType
  - RingAttnFunc

Enums for Axolotl input config

Chat templates configuration subset

Custom supported optimizers

RL trainer type configuration subset

Enum class for supported ring-flash-attn implementations

**Examples:**

Example 1 (python):
```python
utils.schemas.enums.ChatTemplate()
```

Example 2 (python):
```python
utils.schemas.enums.CustomSupportedOptimizers()
```

Example 3 (python):
```python
utils.schemas.enums.RLType()
```

Example 4 (python):
```python
utils.schemas.enums.RingAttnFunc()
```

---

## core.trainers.trl

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.trl.html

**Contents:**
- core.trainers.trl
- Classes
  - AxolotlCPOTrainer
  - AxolotlKTOTrainer
  - AxolotlORPOTrainer
  - AxolotlPRMTrainer
  - AxolotlRewardTrainer

Module for TRL RL trainers

Extend the base CPOTrainer for axolotl helpers

Extend the base KTOTrainer for axolotl helpers

Extend the base ORPOTrainer for axolotl helpers

Extend the base trl.PRMTrainer for axolotl helpers

Extend the base RewardTrainer for axolotl helpers

**Examples:**

Example 1 (python):
```python
core.trainers.trl.AxolotlCPOTrainer(*args, **kwargs)
```

Example 2 (python):
```python
core.trainers.trl.AxolotlKTOTrainer(*args, **kwargs)
```

Example 3 (python):
```python
core.trainers.trl.AxolotlORPOTrainer(*args, **kwargs)
```

Example 4 (python):
```python
core.trainers.trl.AxolotlPRMTrainer(*args, **kwargs)
```

---

## utils.schedulers

**URL:** https://docs.axolotl.ai/docs/api/utils.schedulers.html

**Contents:**
- utils.schedulers
- Classes
  - InterpolatingLogScheduler
  - JaggedLRRestartScheduler
  - RexLR
    - Parameters
- Functions
  - get_cosine_schedule_with_min_lr
    - Create a learning rate schedule which has
  - get_cosine_schedule_with_quadratic_warmup

Module for custom LRScheduler class

A scheduler that interpolates learning rates in a logarithmic fashion

Wraps another scheduler to apply per-lora-restart learning rate warmups.

Reflected Exponential (REX) learning rate scheduler.

Create a schedule with a learning rate that decreases following the values of the cosine function between the initial lr set in the optimizer to 0, after a warmup period during which it increases linearly between 0 and the initial lr set in the optimizer.

torch.optim.lr_scheduler.LambdaLR with the appropriate schedule.

Implementation of Continual Pre-Training of Large Language Models: How to (re)warm your model? (https://arxiv.org/pdf/2308.04014.pdf) Create a schedule with a learning rate that decreases following the values of the cosine function between the initial lr set in the optimizer to min_lr_ratio until num_training_steps * constant_lr_ratio, after constant_rate returns constant value of min_rate , after a warmup period during which it increases linearly between 0 and the initial lr set in the optimizer.

torch.optim.lr_scheduler.LambdaLR with the appropriate schedule.

**Examples:**

Example 1 (python):
```python
utils.schedulers.InterpolatingLogScheduler(
    optimizer,
    num_steps,
    min_lr,
    max_lr,
    last_epoch=-1,
)
```

Example 2 (python):
```python
utils.schedulers.JaggedLRRestartScheduler(
    optimizer,
    inner_schedule,
    jagged_restart_steps,
    jagged_restart_warmup_steps,
    jagged_restart_anneal_steps=1,
    min_lr_scale=0.001,
)
```

Example 3 (python):
```python
utils.schedulers.RexLR(
    optimizer,
    max_lr,
    min_lr,
    total_steps=0,
    num_warmup_steps=0,
    last_step=0,
)
```

Example 4 (python):
```python
utils.schedulers.get_cosine_schedule_with_min_lr(
    optimizer,
    num_warmup_steps,
    num_training_steps,
    min_lr_ratio=0.0,
)
```

---

## cli.merge_lora

**URL:** https://docs.axolotl.ai/docs/api/cli.merge_lora.html

**Contents:**
- cli.merge_lora
- Functions
  - do_cli
    - Parameters
    - Raises
  - do_merge_lora
    - Parameters

CLI to merge a trained LoRA into a base model.

Parses axolotl config, CLI args, and calls do_merge_lora. Note that various config values will be overwritten to allow the LoRA merge logic to work as expected (load_in_8bit=False, load_in4bit=False, flash_attention=False, etc.).

Calls transformers’ merge_and_unload on the model given in the axolotl config along with the LoRA adapters to combine them into a single base model.

**Examples:**

Example 1 (python):
```python
cli.merge_lora.do_cli(config=Path('examples/'), **kwargs)
```

Example 2 (python):
```python
cli.merge_lora.do_merge_lora(cfg)
```

---

## prompt_strategies.alpaca_w_system

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.alpaca_w_system.html

**Contents:**
- prompt_strategies.alpaca_w_system
- Classes
  - InstructionWSystemPromptTokenizingStrategy
  - OpenOrcaPromptTokenizingStrategy
  - OpenOrcaSystemDataPrompter
  - SystemDataPrompter

prompt_strategies.alpaca_w_system

Prompt strategies loader for alpaca instruction datasets with system prompts

Tokenizing strategy for instruction-based prompts.

Tokenizing strategy for OpenOrca datasets

Alpaca Style Prompter that uses system prompts from the dataset, with OpenOrca prompts

Alpaca Style Prompter that uses system prompts from the dataset

**Examples:**

Example 1 (python):
```python
prompt_strategies.alpaca_w_system.InstructionWSystemPromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 2 (python):
```python
prompt_strategies.alpaca_w_system.OpenOrcaPromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 3 (python):
```python
prompt_strategies.alpaca_w_system.OpenOrcaSystemDataPrompter(
    prompt_style=PromptStyle.INSTRUCT.value,
)
```

Example 4 (python):
```python
prompt_strategies.alpaca_w_system.SystemDataPrompter(
    prompt_style=PromptStyle.INSTRUCT.value,
)
```

---

## loaders.patch_manager

**URL:** https://docs.axolotl.ai/docs/api/loaders.patch_manager.html

**Contents:**
- loaders.patch_manager
- Classes
  - PatchManager
    - Attributes
    - Methods
      - apply_post_model_load_patches
      - apply_post_plugin_pre_model_load_patches
      - apply_pre_model_load_patches

loaders.patch_manager

Patch manager class implementation to complement axolotl.loaders.ModelLoader.

Applies pre- and post-model load patches for various fixes and optimizations.

Manages the application of patches during the model loading process.

Apply patches that require the model instance.

Apply post plugin-pre_model_load load patches based on config.

Apply pre-model load patches based on config.

**Examples:**

Example 1 (python):
```python
loaders.patch_manager.PatchManager(cfg, model_config, inference=False)
```

Example 2 (python):
```python
loaders.patch_manager.PatchManager.apply_post_model_load_patches(model)
```

Example 3 (python):
```python
loaders.patch_manager.PatchManager.apply_post_plugin_pre_model_load_patches()
```

Example 4 (python):
```python
loaders.patch_manager.PatchManager.apply_pre_model_load_patches()
```

---

## utils.schemas.peft

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.peft.html

**Contents:**
- utils.schemas.peft
- Classes
  - LoftQConfig
  - LoraConfig
  - PeftConfig
  - ReLoRAConfig

Pydantic models for PEFT-related configuration

LoftQ configuration subset

Peft / LoRA configuration subset

peftq configuration subset

ReLoRA configuration subset

**Examples:**

Example 1 (python):
```python
utils.schemas.peft.LoftQConfig()
```

Example 2 (python):
```python
utils.schemas.peft.LoraConfig()
```

Example 3 (python):
```python
utils.schemas.peft.PeftConfig()
```

Example 4 (python):
```python
utils.schemas.peft.ReLoRAConfig()
```

---

## common.const

**URL:** https://docs.axolotl.ai/docs/api/common.const.html

**Contents:**
- common.const

Various shared constants

---

## prompt_strategies.kto.user_defined

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.kto.user_defined.html

**Contents:**
- prompt_strategies.kto.user_defined

prompt_strategies.kto.user_defined

User-defined KTO strategies

---

## prompt_strategies.base

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.base.html

**Contents:**
- prompt_strategies.base

prompt_strategies.base

module for base dataset transform strategies

---

## cli.delinearize_llama4

**URL:** https://docs.axolotl.ai/docs/api/cli.delinearize_llama4.html

**Contents:**
- cli.delinearize_llama4
- Functions
  - do_cli
    - Parameters

cli.delinearize_llama4

CLI tool to delinearize quantized/Linearized Llama-4 models.

Convert a patched HF format Llama4 model (with separated projections) back to the original HF format (with fused projections).

**Examples:**

Example 1 (python):
```python
cli.delinearize_llama4.do_cli(model, output)
```

---

## integrations.base

**URL:** https://docs.axolotl.ai/docs/api/integrations.base.html

**Contents:**
- integrations.base
- Classes
  - BaseOptimizerFactory
    - Methods
      - get_decay_parameter_names
  - BasePlugin
    - Note
    - Methods
      - add_callbacks_post_trainer
        - Parameters

Base class for all plugins.

A plugin is a reusable, modular, and self-contained piece of code that extends the functionality of Axolotl. Plugins can be used to integrate third-party models, modify the training process, or add new features.

To create a new plugin, you need to inherit from the BasePlugin class and implement the required methods.

Base class for factories to create custom optimizers

Get all parameter names that weight decay will be applied to.

This function filters out parameters in two ways: 1. By layer type (instances of layers specified in ALL_LAYERNORM_LAYERS) 2. By parameter name patterns (containing ‘bias’, or variation of ‘norm’)

Base class for all plugins. Defines the interface for plugin methods.

A plugin is a reusable, modular, and self-contained piece of code that extends the functionality of Axolotl. Plugins can be used to integrate third-party models, modify the training process, or add new features.

To create a new plugin, you need to inherit from the BasePlugin class and implement the required methods.

Plugin methods include: - register(cfg): Registers the plugin with the given configuration. - load_datasets(cfg): Loads and preprocesses the dataset for training. - pre_model_load(cfg): Performs actions before the model is loaded. - post_model_build(cfg, model): Performs actions after the model is loaded, but before LoRA adapters are applied. - pre_lora_load(cfg, model): Performs actions before LoRA weights are loaded. - post_lora_load(cfg, model): Performs actions after LoRA weights are loaded. - post_model_load(cfg, model): Performs actions after the model is loaded, inclusive of any adapters. - post_trainer_create(cfg, trainer): Performs actions after the trainer is created. - create_optimizer(cfg, trainer): Creates and returns an optimizer for training. - create_lr_scheduler(cfg, trainer, optimizer, num_training_steps): Creates and returns a learning rate scheduler. - add_callbacks_pre_trainer(cfg, model): Adds callbacks to the trainer before training. - add_callbacks_post_trainer(cfg, trainer): Adds callbacks to the trainer after training.

Adds callbacks to the trainer after creating the trainer. This is useful for callbacks that require access to the model or trainer.

Set up callbacks before creating the trainer.

Creates and returns a learning rate scheduler.

Creates and returns an optimizer for training.

Returns a custom class for the collator.

Returns a pydantic model for the plugin’s input arguments.

Returns a custom class for the trainer.

Returns custom training arguments to set on TrainingArgs.

Returns a dataclass model for the plugin’s training arguments.

Loads and preprocesses the dataset for training.

Performs actions after LoRA weights are loaded.

Performs actions after the model is built/loaded, but before any adapters are applied.

Performs actions after the model is loaded.

Performs actions after training is complete.

Performs actions after training is complete and the model is unloaded.

Performs actions after the trainer is created.

Performs actions before LoRA weights are loaded.

Performs actions before the model is loaded.

Registers the plugin with the given configuration as an unparsed dict.

The PluginManager class is responsible for loading and managing plugins. It should be a singleton so it can be accessed from anywhere in the codebase.

Key methods include: - get_instance(): Static method to get the singleton instance of PluginManager. - register(plugin_name: str): Registers a new plugin by its name. - pre_model_load(cfg): Calls the pre_model_load method of all registered plugins.

Calls the add_callbacks_post_trainer method of all registered plugins.

Calls the add_callbacks_pre_trainer method of all registered plugins.

Calls the create_lr_scheduler method of all registered plugins and returns the first non-None scheduler.

Calls the create_optimizer method of all registered plugins and returns the first non-None optimizer.

Calls the get_collator_cls_and_kwargs method of all registered plugins and returns the first non-None collator class.

Parameters: cfg (dict): The configuration for the plugins. is_eval (bool): Whether this is an eval split.

Returns: object: The collator class, or None if none was found.

Returns a list of Pydantic classes for all registered plugins’ input arguments.’

Returns the singleton instance of PluginManager. If the instance doesn’t exist, it creates a new one.

Calls the get_trainer_cls method of all registered plugins and returns the first non-None trainer class.

Calls the get_training_args method of all registered plugins and returns the combined training arguments.

Parameters: cfg (dict): The configuration for the plugins.

Returns: object: The training arguments

Returns a list of dataclasses for all registered plugins’ training args mixins’

Returns: list[str]: A list of dataclsses

Calls the load_datasets method of each registered plugin.

Calls the post_lora_load method of all registered plugins.

Calls the post_model_build method of all registered plugins after the model has been built / loaded, but before any adapters have been applied.

Calls the post_model_load method of all registered plugins after the model has been loaded inclusive of any adapters.

Calls the post_train method of all registered plugins.

Calls the post_train_unload method of all registered plugins.

Calls the post_trainer_create method of all registered plugins.

Calls the pre_lora_load method of all registered plugins.

Calls the pre_model_load method of all registered plugins.

Registers a new plugin by its name.

Loads a plugin based on the given plugin name.

The plugin name should be in the format “module_name.class_name”. This function splits the plugin name into module and class, imports the module, retrieves the class from the module, and creates an instance of the class.

**Examples:**

Example 1 (python):
```python
integrations.base.BaseOptimizerFactory()
```

Example 2 (python):
```python
integrations.base.BaseOptimizerFactory.get_decay_parameter_names(model)
```

Example 3 (python):
```python
integrations.base.BasePlugin()
```

Example 4 (python):
```python
integrations.base.BasePlugin.add_callbacks_post_trainer(cfg, trainer)
```

---

## prompt_strategies.chat_template

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.chat_template.html

**Contents:**
- prompt_strategies.chat_template
- Classes
  - ChatTemplatePrompter
    - Methods
      - build_prompt
        - Parameters
  - ChatTemplateStrategy
    - Methods
      - find_first_eot_token
      - find_turn

prompt_strategies.chat_template

HF Chat Templates prompt strategy

Prompter for HF chat templates

Build a prompt from a conversation.

Tokenizing strategy for instruction-based prompts.

Find the first EOT token in the input_ids starting from start_idx.

Locate the starting and ending indices of the specified turn in a conversation.

Public method that can handle either a single prompt or a batch of prompts.

Mistral prompter for chat template.

Mistral strategy for chat template.

Find the first EOT token in the input_ids starting from start_idx.

Load chat template strategy based on configuration.

**Examples:**

Example 1 (python):
```python
prompt_strategies.chat_template.ChatTemplatePrompter(
    tokenizer,
    chat_template,
    processor=None,
    max_length=2048,
    message_property_mappings=None,
    message_field_training=None,
    message_field_training_detail=None,
    field_messages='messages',
    field_system='system',
    field_tools='tools',
    field_thinking='reasoning_content',
    roles=None,
    template_thinking_key='reasoning_content',
    chat_template_kwargs=None,
    drop_system_message=False,
)
```

Example 2 (python):
```python
prompt_strategies.chat_template.ChatTemplatePrompter.build_prompt(
    conversation,
    add_generation_prompt=False,
    images=None,
    tools=None,
)
```

Example 3 (python):
```python
prompt_strategies.chat_template.ChatTemplateStrategy(
    prompter,
    tokenizer,
    train_on_inputs,
    sequence_len,
    roles_to_train=None,
    train_on_eos=None,
    train_on_eot=None,
    eot_tokens=None,
    split_thinking=False,
)
```

Example 4 (python):
```python
prompt_strategies.chat_template.ChatTemplateStrategy.find_first_eot_token(
    input_ids,
    start_idx,
)
```

---

## kernels.quantize

**URL:** https://docs.axolotl.ai/docs/api/kernels.quantize.html

**Contents:**
- kernels.quantize
- Functions
  - dequantize
    - Parameters
    - Returns
    - Raises
    - Note

Dequantization utilities for bitsandbytes integration.

Fast NF4 dequantization using bitsandbytes CUDA kernels.

Performs efficient dequantization of weights from NF4 format using bitsandbytes’ optimized CUDA implementations. Supports both legacy list and new QuantState formats.

Uses CUDA streams for better performance when available in newer bitsandbytes versions (>0.43.3).

**Examples:**

Example 1 (python):
```python
kernels.quantize.dequantize(W, quant_state=None, out=None)
```

---

## integrations.spectrum.args

**URL:** https://docs.axolotl.ai/docs/api/integrations.spectrum.args.html

**Contents:**
- integrations.spectrum.args
- Classes
  - SpectrumArgs

integrations.spectrum.args

Module for handling Spectrum input arguments.

Input args for Spectrum.

**Examples:**

Example 1 (python):
```python
integrations.spectrum.args.SpectrumArgs()
```

---

## prompt_strategies.alpaca_chat

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.alpaca_chat.html

**Contents:**
- prompt_strategies.alpaca_chat
- Classes
  - AlpacaChatPrompter
  - AlpacaConcisePrompter
  - AlpacaQAPromptTokenizingStrategy
  - CamelAIPromptTokenizingStrategy
  - NoSystemPrompter

prompt_strategies.alpaca_chat

Module for Alpaca prompt strategy classes

Alpaca Chat Prompter extending the system prompt to for chat-instruct answers

Alpaca Prompter extending the system prompt to ask for concise chat-instruct answers

Tokenizing strategy for AlpacaQA

Tokenizing strategy for CamelAI datasets

Null Prompter with no system prompts

**Examples:**

Example 1 (python):
```python
prompt_strategies.alpaca_chat.AlpacaChatPrompter()
```

Example 2 (python):
```python
prompt_strategies.alpaca_chat.AlpacaConcisePrompter(
    prompt_style=PromptStyle.INSTRUCT.value,
)
```

Example 3 (python):
```python
prompt_strategies.alpaca_chat.AlpacaQAPromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 4 (python):
```python
prompt_strategies.alpaca_chat.CamelAIPromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

---

## utils.collators.mamba

**URL:** https://docs.axolotl.ai/docs/api/utils.collators.mamba.html

**Contents:**
- utils.collators.mamba
- Classes
  - MambaDataCollator

utils.collators.mamba

Collator for State Space Models (Mamba)

**Examples:**

Example 1 (python):
```python
utils.collators.mamba.MambaDataCollator(tokenizer)
```

---

## prompt_strategies.messages.chat

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.messages.chat.html

**Contents:**
- prompt_strategies.messages.chat
- Classes
  - ChatMessageDatasetWrappingStrategy

prompt_strategies.messages.chat

Chat dataset wrapping strategy for new internal messages representations

Chat dataset wrapping strategy for new internal messages representations

**Examples:**

Example 1 (python):
```python
prompt_strategies.messages.chat.ChatMessageDatasetWrappingStrategy(
    processor,
    message_transform=None,
    formatter=None,
    **kwargs,
)
```

---

## train

**URL:** https://docs.axolotl.ai/docs/api/train.html

**Contents:**
- train
- Functions
  - create_model_card
    - Parameters
  - execute_training
    - Parameters
  - handle_untrained_tokens_fix
    - Parameters
  - save_initial_configs
    - Parameters

Prepare and train a model on a dataset. Can also infer from a model or merge lora

Create a model card for the trained model if needed.

Execute the training process with appropriate SDP kernel configurations.

Apply fixes for untrained tokens if configured.

Save initial configurations before training.

Save the trained model according to configuration and training setup.

Load the tokenizer, processor (for multimodal models), and model based on configuration.

Load model, tokenizer, trainer, etc. Helper function to encapsulate the full trainer setup.

Set up the Axolotl badge and add the Axolotl config to the model card if available.

Set up the reference model for RL training if needed.

Set up signal handler for graceful termination.

Train a model on the given dataset.

**Examples:**

Example 1 (python):
```python
train.create_model_card(cfg, trainer)
```

Example 2 (python):
```python
train.execute_training(cfg, trainer, resume_from_checkpoint)
```

Example 3 (python):
```python
train.handle_untrained_tokens_fix(
    cfg,
    model,
    tokenizer,
    train_dataset,
    safe_serialization,
)
```

Example 4 (python):
```python
train.save_initial_configs(cfg, tokenizer, model, peft_config, processor)
```

---

## cli.utils.load

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.load.html

**Contents:**
- cli.utils.load
- Functions
  - load_model_and_tokenizer
    - Parameters
    - Returns

Utilities for model, tokenizer, etc. loading.

Helper function for loading a model, tokenizer, and processor specified in the given axolotl config.

**Examples:**

Example 1 (python):
```python
cli.utils.load.load_model_and_tokenizer(cfg, inference=False)
```

---

## loaders.model

**URL:** https://docs.axolotl.ai/docs/api/loaders.model.html

**Contents:**
- loaders.model
- Classes
  - ModelLoader
    - The loading process includes
    - Attributes
    - Methods
      - load
        - Returns

Model loader class implementation for loading, configuring, and patching various models.

Manages model configuration, initialization and application of patches during model loading.

This class orchestrates the entire process of loading a model from configuration to final preparation. It handles device mapping, quantization, attention mechanisms, adapter integration, and various optimizations.

Load and prepare the model with all configurations and patches.

**Examples:**

Example 1 (python):
```python
loaders.model.ModelLoader(
    cfg,
    tokenizer,
    *,
    inference=False,
    reference_model=False,
    **kwargs,
)
```

Example 2 (python):
```python
loaders.model.ModelLoader.load()
```

---

## utils.distributed

**URL:** https://docs.axolotl.ai/docs/api/utils.distributed.html

**Contents:**
- utils.distributed
- Functions
  - barrier
  - cleanup_distributed
  - compute_and_broadcast
  - gather_from_all_ranks
  - gather_scalar_from_all_ranks
  - is_distributed
  - is_main_process
    - Returns

Utilities for distributed functionality.

Acts as a barrier to wait for all processes. This ensures that all processes reach the barrier before proceeding further.

Destroy process group if torch distributed is initialized. Called in training early termination or when training successfully completes.

Compute a value using the function ‘fn’ only on the specified rank (default is 0). The value is then broadcasted to all other ranks.

Args: - fn (callable): A function that computes the value. This should not have any side effects. - rank (int, optional): The rank that computes the value. Default is 0.

Returns: - The computed value (int or float).

Run a callable ‘fn’ on all ranks and gather the results on the specified rank.

Args: - fn (callable): A function that computes the value. This should not have any side effects. - rank (int, optional): The rank that gathers the values. Default is 0. - world_size (int, optional): Total number of processes in the current distributed setup.

Returns: - A list of computed values from all ranks if on the gathering rank, otherwise None.

Run a callable ‘fn’ on all ranks and gather the results on the specified rank.

Args: - fn (callable): A function that computes the value. This should not have any side effects. - rank (int, optional): The rank that gathers the values. Default is 0. - world_size (int, optional): Total number of processes in the current distributed setup.

Returns: - A list of computed values from all ranks if on the gathering rank, otherwise None.

Check if distributed training is initialized.

Check if the current process is the main process. If not in distributed mode, always return True.

We use a simpler logic when the distributed state is not initialized: we just log on the 0-th local rank.

Run a callable ‘fn1’ on all ranks, gather the results, reduce them using ‘fn2’, and then broadcast the reduced result to all ranks.

Args: - fn1 (callable): A function that computes the value on each rank. - fn2 (callable): A reduction function that takes a list of values and returns a single value. - world_size (int, optional): Total number of processes in the current distributed setup.

Returns: - The reduced and broadcasted value.

runs the wrapped context so that rank 0 runs first before other ranks

**Examples:**

Example 1 (python):
```python
utils.distributed.barrier()
```

Example 2 (python):
```python
utils.distributed.cleanup_distributed()
```

Example 3 (python):
```python
utils.distributed.compute_and_broadcast(fn)
```

Example 4 (python):
```python
utils.distributed.gather_from_all_ranks(fn, world_size=1)
```

---

## cli.config

**URL:** https://docs.axolotl.ai/docs/api/cli.config.html

**Contents:**
- cli.config
- Functions
  - check_remote_config
    - Parameters
    - Returns
    - Raises
  - choose_config
    - Parameters
    - Returns
    - Raises

Configuration loading and processing.

First, determines if the passed config is a valid HTTPS URL. Then, attempts to query for it and parse its content, first as JSON, then as YAML (YAML is preferred). Finally, the parsed content is written to a local file and its path is returned.

Helper method for choosing a axolotl config YAML file (considering only files ending with .yml or .yaml). If more than one config file exists in the passed path, the user is prompted to choose one.

Loads the axolotl configuration stored at config, validates it, and performs various setup.

Registers the plugins for the given configuration.

**Examples:**

Example 1 (python):
```python
cli.config.check_remote_config(config)
```

Example 2 (python):
```python
cli.config.choose_config(path)
```

Example 3 (python):
```python
cli.config.load_cfg(config=Path('examples/'), **kwargs)
```

Example 4 (python):
```python
cli.config.prepare_plugins(cfg)
```

---

## cli.checks

**URL:** https://docs.axolotl.ai/docs/api/cli.checks.html

**Contents:**
- cli.checks
- Functions
  - check_accelerate_default_config
  - check_user_token
    - Returns
    - Raises

Various checks for Axolotl CLI.

Logs at warning level if no accelerate config file is found.

Checks for HF user info. Check is skipped if HF_HUB_OFFLINE=1.

**Examples:**

Example 1 (python):
```python
cli.checks.check_accelerate_default_config()
```

Example 2 (python):
```python
cli.checks.check_user_token()
```

---

## prompt_strategies.llama2_chat

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.llama2_chat.html

**Contents:**
- prompt_strategies.llama2_chat
- Classes
  - LLama2ChatTokenizingStrategy
  - Llama2ChatConversation
    - Methods
      - append_message
      - get_prompt
  - Llama2ChatPrompter

prompt_strategies.llama2_chat

Prompt Strategy for finetuning Llama2 chat models see also https://github.com/facebookresearch/llama/blob/6c7fe276574e78057f917549435a2554000a876d/llama/generation.py#L213 for ma reference implementation.

This implementation is based on the Vicuna PR and the fastchat repo, see also: https://github.com/lm-sys/FastChat/blob/cdd7730686cb1bf9ae2b768ee171bdf7d1ff04f3/fastchat/conversation.py#L847

Use dataset type: “llama2_chat” in config.yml to use this prompt style.

E.g. in the config.yml:

The dataset itself should look like this:

in a jsonl file. The first message should be from the human, the second from gpt. For a custom system message, the first “from” can be “system” (followed by alternating “human” and “gpt” turns).

Important: Don’t use “special_tokens:” in your config.yml if you are not sure what you are doing!

Tokenizing strategy for Llama2 prompts. adapted from https://github.com/lm-sys/FastChat/blob/main/fastchat/train/train.py

A class that manages prompt templates and keeps all conversation history. copied from https://github.com/lm-sys/FastChat/blob/main/fastchat/conversation.py

Append a new message.

Get the prompt for generation.

A prompter that generates prompts for Llama2 models.

**Examples:**

Example 1 (unknown):
```unknown
datasets:
  - path: llama_finetune_train.jsonl
    type: llama2_chat
```

Example 2 (unknown):
```unknown
{'conversations':[{"from": "human", "value": "Who are you?"}, {"from": "gpt", "value": "I am Vicuna"},...]}
```

Example 3 (python):
```python
prompt_strategies.llama2_chat.LLama2ChatTokenizingStrategy(*args, **kwargs)
```

Example 4 (python):
```python
prompt_strategies.llama2_chat.Llama2ChatConversation(
    name='llama2',
    system="[INST] <<SYS>>\nYou are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\n\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information.\n<</SYS>>\n\n",
    roles=('[INST]', '[/INST]'),
    messages=list(),
    offset=0,
)
```

---

## cli.utils

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.html

**Contents:**
- cli.utils

Init for axolotl.cli.utils module.

---

## cli.utils.args

**URL:** https://docs.axolotl.ai/docs/api/cli.utils.args.html

**Contents:**
- cli.utils.args
- Functions
  - add_options_from_config
    - Parameters
    - Returns
  - add_options_from_dataclass
    - Parameters
    - Returns
  - filter_none_kwargs
    - Parameters

Utilities for axolotl CLI args.

Create Click options from the fields of a Pydantic model.

Create Click options from the fields of a dataclass.

Wraps function to remove None-valued kwargs.

**Examples:**

Example 1 (python):
```python
cli.utils.args.add_options_from_config(config_class)
```

Example 2 (python):
```python
cli.utils.args.add_options_from_dataclass(config_class)
```

Example 3 (python):
```python
cli.utils.args.filter_none_kwargs(func)
```

---

## integrations.grokfast.optimizer

**URL:** https://docs.axolotl.ai/docs/api/integrations.grokfast.optimizer.html

**Contents:**
- integrations.grokfast.optimizer

integrations.grokfast.optimizer

---

## core.builders.causal

**URL:** https://docs.axolotl.ai/docs/api/core.builders.causal.html

**Contents:**
- core.builders.causal
- Classes
  - HFCausalTrainerBuilder

Builder for causal trainers

Build the HuggingFace training args/trainer for causal models and reward modeling using TRL.

**Examples:**

Example 1 (python):
```python
core.builders.causal.HFCausalTrainerBuilder(
    cfg,
    model,
    tokenizer,
    processor=None,
)
```

---

## prompt_strategies.dpo.user_defined

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.user_defined.html

**Contents:**
- prompt_strategies.dpo.user_defined

prompt_strategies.dpo.user_defined

User-defined DPO strategies

---

## cli.evaluate

**URL:** https://docs.axolotl.ai/docs/api/cli.evaluate.html

**Contents:**
- cli.evaluate
- Functions
  - do_cli
    - Parameters
  - do_evaluate
    - Parameters

CLI to run evaluation on a model.

Parses axolotl config, CLI args, and calls do_evaluate.

Evaluates a transformers model by first loading the dataset(s) specified in the axolotl config, and then calling axolotl.evaluate.evaluate, which computes evaluation metrics on the given dataset(s) and writes them to disk.

**Examples:**

Example 1 (python):
```python
cli.evaluate.do_cli(config=Path('examples/'), **kwargs)
```

Example 2 (python):
```python
cli.evaluate.do_evaluate(cfg, cli_args)
```

---

## utils.schemas.utils

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.utils.html

**Contents:**
- utils.schemas.utils
- Functions
  - handle_legacy_message_fields_logic
    - Parameters
    - Returns
    - Raises

Utilities for Axolotl Pydantic models

Handle backwards compatibility between legacy message field mapping and new property mapping system.

Previously, the config only supported mapping ‘role’ and ‘content’ fields via dedicated config options: - message_field_role: Mapped to the role field - message_field_content: Mapped to the content field

The new system uses message_property_mappings to support arbitrary field mappings: message_property_mappings: role: source_role_field content: source_content_field additional_field: source_field

**Examples:**

Example 1 (python):
```python
utils.schemas.utils.handle_legacy_message_fields_logic(data)
```

---

## prompt_strategies.alpaca_instruct

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.alpaca_instruct.html

**Contents:**
- prompt_strategies.alpaca_instruct

prompt_strategies.alpaca_instruct

Module loading the AlpacaInstructPromptTokenizingStrategy class

---

## utils.callbacks.lisa

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.lisa.html

**Contents:**
- utils.callbacks.lisa

Adapted from https://github.com/OptimalScale/LMFlow/pull/701 for HF transformers & Axolotl Arxiv: https://arxiv.org/abs/2403.17919 License: Apache 2.0

---

## models.mamba.modeling_mamba

**URL:** https://docs.axolotl.ai/docs/api/models.mamba.modeling_mamba.html

**Contents:**
- models.mamba.modeling_mamba

models.mamba.modeling_mamba

---

## prompt_strategies.metharme

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.metharme.html

**Contents:**
- prompt_strategies.metharme
- Classes
  - MetharmePromptTokenizingStrategy
  - MetharmePrompter

prompt_strategies.metharme

Module containing the MetharmenPromptTokenizingStrategy and MetharmePrompter class

Tokenizing strategy for the Metharme models

Prompter for the Metharme models.

**Examples:**

Example 1 (python):
```python
prompt_strategies.metharme.MetharmePromptTokenizingStrategy(
    prompter,
    tokenizer,
    train_on_inputs=False,
    sequence_len=2048,
)
```

Example 2 (python):
```python
prompt_strategies.metharme.MetharmePrompter(*args, **kwargs)
```

---

## core.trainers.mamba

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.mamba.html

**Contents:**
- core.trainers.mamba
- Classes
  - AxolotlMambaTrainer

Module for mamba trainer

Mamba specific trainer to handle loss calculation

**Examples:**

Example 1 (python):
```python
core.trainers.mamba.AxolotlMambaTrainer(
    *_args,
    bench_data_collator=None,
    eval_data_collator=None,
    dataset_tags=None,
    **kwargs,
)
```

---

## utils.ctx_managers.sequence_parallel

**URL:** https://docs.axolotl.ai/docs/api/utils.ctx_managers.sequence_parallel.html

**Contents:**
- utils.ctx_managers.sequence_parallel
- Classes
  - AllGatherWithGrad
    - Methods
      - backward
        - Parameters
        - Returns
      - forward
        - Parameters
        - Returns

utils.ctx_managers.sequence_parallel

Module for Axolotl trainer sequence parallelism manager and utilities

Custom autograd function for all-gather to preserve gradients.

Backward pass for all-gather operation.

Extracts the gradient slice corresponding to this rank’s original input from the full gradient tensor.

Forward pass of all-gather of data with sequence dimension.

Context manager for sequence parallelism operations.

This class provides a context that will automatically apply sequence parallelism during model forward passes using a pre-forward hook, and gather outputs from across the sequence parallelism group using a post-forward hook.

Apply sequence parallelism slicing to a batch.

Special handling is implemented for integer logits_to_keep, which indicates to only keep the last N tokens in the sequence during generation.

**Examples:**

Example 1 (python):
```python
utils.ctx_managers.sequence_parallel.AllGatherWithGrad()
```

Example 2 (python):
```python
utils.ctx_managers.sequence_parallel.AllGatherWithGrad.backward(
    ctx,
    grad_output,
)
```

Example 3 (python):
```python
utils.ctx_managers.sequence_parallel.AllGatherWithGrad.forward(
    ctx,
    input_tensor,
    group,
)
```

Example 4 (python):
```python
utils.ctx_managers.sequence_parallel.SequenceParallelContextManager(
    models,
    context_parallel_size,
    gradient_accumulation_steps,
    ring_attn_func,
    heads_k_stride,
    gather_outputs,
    device_mesh=None,
)
```

---

## utils.callbacks.qat

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.qat.html

**Contents:**
- utils.callbacks.qat
- Classes
  - QATCallback
- Functions
  - toggle_fake_quant
    - Parameters

QAT Callback for HF Causal Trainer

Callback to toggle fake quantization for the model.

Toggle fake quantization for any fake quantized linear or embedding layers in the model.

**Examples:**

Example 1 (python):
```python
utils.callbacks.qat.QATCallback(cfg)
```

Example 2 (python):
```python
utils.callbacks.qat.toggle_fake_quant(mod, enable)
```

---

## prompt_strategies.dpo.zephyr

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.zephyr.html

**Contents:**
- prompt_strategies.dpo.zephyr

prompt_strategies.dpo.zephyr

DPO strategies for zephyr

---

## kernels.utils

**URL:** https://docs.axolotl.ai/docs/api/kernels.utils.html

**Contents:**
- kernels.utils

Utilities for axolotl.kernels submodules.

---

## monkeypatch.multipack

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.multipack.html

**Contents:**
- monkeypatch.multipack

monkeypatch.multipack

multipack patching for v2 of sample packing

---

## cli.main

**URL:** https://docs.axolotl.ai/docs/api/cli.main.html

**Contents:**
- cli.main
- Functions
  - cli
  - evaluate
    - Parameters
  - fetch
    - Parameters
  - inference
    - Parameters
  - merge_lora

Click CLI definitions for various axolotl commands.

Axolotl CLI - Train and fine-tune large language models

Fetch example configs or other resources.

Available directories: - examples: Example configuration files - deepspeed_configs: DeepSpeed configuration files

Run inference with a trained model.

Merge trained LoRA adapters into a base model.

Merge sharded FSDP model weights.

Preprocess datasets before training.

Train or fine-tune a model.

**Examples:**

Example 1 (python):
```python
cli.main.cli()
```

Example 2 (python):
```python
cli.main.evaluate(ctx, config, launcher, **kwargs)
```

Example 3 (python):
```python
cli.main.fetch(directory, dest)
```

Example 4 (python):
```python
cli.main.inference(ctx, config, launcher, gradio, **kwargs)
```

---

## core.trainers.mixins.optimizer

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.mixins.optimizer.html

**Contents:**
- core.trainers.mixins.optimizer
- Classes
  - OptimizerInitMixin
  - OptimizerMixin

core.trainers.mixins.optimizer

Module for Axolotl trainer optimizer mixin

Mixin to handle common optimizer initialization logic for Trainers (mostly TRL) that do not accept optimizer_cls_and_kwargs as kwarg in constructor.

Mixin class for shared handling of building custom optimizers

**Examples:**

Example 1 (python):
```python
core.trainers.mixins.optimizer.OptimizerInitMixin(*args, **kwargs)
```

Example 2 (python):
```python
core.trainers.mixins.optimizer.OptimizerMixin()
```

---

## integrations.kd.trainer

**URL:** https://docs.axolotl.ai/docs/api/integrations.kd.trainer.html

**Contents:**
- integrations.kd.trainer
- Classes
  - AxolotlKDTrainer
    - Methods
      - compute_loss

integrations.kd.trainer

Custom trainer subclass for Knowledge Distillation (KD)

How the loss is computed by Trainer. By default, all models return the loss in the first element.

Subclass and override for custom behavior.

**Examples:**

Example 1 (python):
```python
integrations.kd.trainer.AxolotlKDTrainer(*args, **kwargs)
```

Example 2 (python):
```python
integrations.kd.trainer.AxolotlKDTrainer.compute_loss(
    model,
    inputs,
    return_outputs=False,
    num_items_in_batch=None,
)
```

---

## integrations.lm_eval.args

**URL:** https://docs.axolotl.ai/docs/api/integrations.lm_eval.args.html

**Contents:**
- integrations.lm_eval.args
- Classes
  - LMEvalArgs

integrations.lm_eval.args

Module for handling lm eval harness input arguments.

Input args for lm eval harness

**Examples:**

Example 1 (python):
```python
integrations.lm_eval.args.LMEvalArgs()
```

---

## integrations.cut_cross_entropy.args

**URL:** https://docs.axolotl.ai/docs/api/integrations.cut_cross_entropy.args.html

**Contents:**
- integrations.cut_cross_entropy.args
- Classes
  - CutCrossEntropyArgs

integrations.cut_cross_entropy.args

Module for handling Cut Cross Entropy input arguments.

Input args for Cut Cross Entropy.

**Examples:**

Example 1 (python):
```python
integrations.cut_cross_entropy.args.CutCrossEntropyArgs()
```

---

## monkeypatch.mistral_attn_hijack_flash

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.mistral_attn_hijack_flash.html

**Contents:**
- monkeypatch.mistral_attn_hijack_flash

monkeypatch.mistral_attn_hijack_flash

Flash attention monkey patch for mistral model

---

## loaders.constants

**URL:** https://docs.axolotl.ai/docs/api/loaders.constants.html

**Contents:**
- loaders.constants

Shared constants for axolotl.loaders module

---

## utils.bench

**URL:** https://docs.axolotl.ai/docs/api/utils.bench.html

**Contents:**
- utils.bench
- Functions
  - check_cuda_device

Benchmarking and measurement utilities

wraps a function and returns the default value instead of running the wrapped function if cuda isn’t available or the device is auto :param default_value: :return:

**Examples:**

Example 1 (python):
```python
utils.bench.check_cuda_device(default_value)
```

---

## utils.trainer

**URL:** https://docs.axolotl.ai/docs/api/utils.trainer.html

**Contents:**
- utils.trainer
- Functions
  - add_pose_position_ids
  - add_position_ids
  - drop_long_seq
  - setup_trainer
    - Parameters
    - Returns

Module containing the Trainer class and related functions

use the PoSE technique to extend the context length by randomly skipping positions in the context. We only want to skip right before tokens in the split_on_token_ids list. We should attempt to randomly distribute the skips, but we don’t need the final position_ids to be the full context_len. There may be multiple turns in the context, so we want to make sure we take into account the maximum possible number of skips remaining in each sample.

Handle both single-example and batched data. - single example: sample[‘input_ids’] is a list[int] - batched data: sample[‘input_ids’] is a list[list[int]]

Drop samples whose sequence length is either too long (> sequence_len) or too short (< min_sequence_len).

Works for both single-example (list[int]) or batched (list[list[int]]).

Helper method for instantiating and building a (causal or RLHF) trainer.

**Examples:**

Example 1 (python):
```python
utils.trainer.add_pose_position_ids(
    sample,
    max_context_len=32768,
    split_on_token_ids=None,
    chunks=2,
)
```

Example 2 (python):
```python
utils.trainer.add_position_ids(sample)
```

Example 3 (python):
```python
utils.trainer.drop_long_seq(sample, sequence_len=2048, min_sequence_len=2)
```

Example 4 (python):
```python
utils.trainer.setup_trainer(
    cfg,
    train_dataset,
    eval_dataset,
    model,
    tokenizer,
    processor,
    total_num_steps,
    model_ref=None,
    peft_config=None,
)
```

---

## utils.schemas.config

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.config.html

**Contents:**
- utils.schemas.config
- Classes
  - AxolotlConfigWCapabilities
  - AxolotlInputConfig

Module with Pydantic models for configuration.

wrapper to valdiate GPU capabilities with the configured options

Wrapper of all config options.

**Examples:**

Example 1 (python):
```python
utils.schemas.config.AxolotlConfigWCapabilities()
```

Example 2 (python):
```python
utils.schemas.config.AxolotlInputConfig()
```

---

## cli.args

**URL:** https://docs.axolotl.ai/docs/api/cli.args.html

**Contents:**
- cli.args
- Classes
  - EvaluateCliArgs
  - InferenceCliArgs
  - PreprocessCliArgs
  - QuantizeCliArgs
  - TrainerCliArgs
  - VllmServeCliArgs

Module for axolotl CLI command arguments.

Dataclass with CLI arguments for axolotl evaluate command.

Dataclass with CLI arguments for axolotl inference command.

Dataclass with CLI arguments for axolotl preprocess command.

Dataclass with CLI arguments for axolotl quantize command.

Dataclass with CLI arguments for axolotl train command.

Dataclass with CLI arguments for axolotl vllm-serve command.

**Examples:**

Example 1 (python):
```python
cli.args.EvaluateCliArgs(
    debug=False,
    debug_text_only=False,
    debug_num_examples=0,
)
```

Example 2 (python):
```python
cli.args.InferenceCliArgs(prompter=None)
```

Example 3 (python):
```python
cli.args.PreprocessCliArgs(
    debug=False,
    debug_text_only=False,
    debug_num_examples=1,
    prompter=None,
    download=True,
    iterable=False,
)
```

Example 4 (python):
```python
cli.args.QuantizeCliArgs(
    base_model=None,
    weight_dtype=None,
    activation_dtype=None,
    quantize_embedding=None,
    group_size=None,
    output_dir=None,
    hub_model_id=None,
)
```

---

## common.architectures

**URL:** https://docs.axolotl.ai/docs/api/common.architectures.html

**Contents:**
- common.architectures

Common architecture specific constants

---

## cli.merge_sharded_fsdp_weights

**URL:** https://docs.axolotl.ai/docs/api/cli.merge_sharded_fsdp_weights.html

**Contents:**
- cli.merge_sharded_fsdp_weights
- Classes
  - BFloat16CastPlanner
- Functions
  - do_cli
    - Parameters
  - merge_fsdp_weights
    - Parameters
    - Raises

cli.merge_sharded_fsdp_weights

CLI to merge sharded FSDP model checkpoints into a single combined checkpoint.

A custom planner to cast tensors to bfloat16 on the fly during loading.

Parses axolotl config, CLI args, and calls merge_fsdp_weights.

Merge the weights from sharded FSDP model checkpoints into a single combined checkpoint. Should be used if SHARDED_STATE_DICT was used for the model. Weights will be saved to {output_path}/model.safetensors if safe_serialization else pytorch_model.bin.

Note: this is a CPU-bound process.

**Examples:**

Example 1 (python):
```python
cli.merge_sharded_fsdp_weights.BFloat16CastPlanner()
```

Example 2 (python):
```python
cli.merge_sharded_fsdp_weights.do_cli(config=Path('examples/'), **kwargs)
```

Example 3 (python):
```python
cli.merge_sharded_fsdp_weights.merge_fsdp_weights(
    checkpoint_dir,
    output_path,
    safe_serialization=False,
    remove_checkpoint_dir=False,
)
```

---

## utils.data.streaming

**URL:** https://docs.axolotl.ai/docs/api/utils.data.streaming.html

**Contents:**
- utils.data.streaming

Data handling specific to streaming datasets.

---

## core.chat.format.chatml

**URL:** https://docs.axolotl.ai/docs/api/core.chat.format.chatml.html

**Contents:**
- core.chat.format.chatml

core.chat.format.chatml

ChatML transformation functions for MessageContents

---

## prompt_strategies.kto.chatml

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.kto.chatml.html

**Contents:**
- prompt_strategies.kto.chatml
- Functions
  - argilla_chat
  - intel
  - ultra

prompt_strategies.kto.chatml

KTO strategies for chatml

for argilla/kto-mix-15k conversations

For Intel Orca KTO ex: argilla/distilabel-intel-orca-kto

for ultrafeedback binarized conversations ex: argilla/ultrafeedback-binarized-preferences-cleaned-kto

**Examples:**

Example 1 (python):
```python
prompt_strategies.kto.chatml.argilla_chat(cfg, **kwargs)
```

Example 2 (python):
```python
prompt_strategies.kto.chatml.intel(cfg, **kwargs)
```

Example 3 (python):
```python
prompt_strategies.kto.chatml.ultra(cfg, **kwargs)
```

---

## utils.schemas.trl

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.trl.html

**Contents:**
- utils.schemas.trl
- Classes
  - TRLConfig

Pydantic models for TRL trainer configuration

**Examples:**

Example 1 (python):
```python
utils.schemas.trl.TRLConfig()
```

---

## monkeypatch.llama_attn_hijack_xformers

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.llama_attn_hijack_xformers.html

**Contents:**
- monkeypatch.llama_attn_hijack_xformers

monkeypatch.llama_attn_hijack_xformers

Directly copied the code from https://raw.githubusercontent.com/oobabooga/text-generation-webui/main/modules/llama_attn_hijack.py and made some adjustments

---

## kernels.geglu

**URL:** https://docs.axolotl.ai/docs/api/kernels.geglu.html

**Contents:**
- kernels.geglu
- Functions
  - geglu_backward
    - Parameters
    - Returns
    - Note
  - geglu_forward
    - Parameters
    - Returns

Module for definition of GEGLU Triton kernels.

See “GLU Variants Improve Transformer” (https://arxiv.org/abs/2002.05202).

Credit to unsloth (https://unsloth.ai/) for inspiration for this implementation.

GEGLU backward pass using in-place operations.

This function modifies its input tensors in-place to store results.

**Examples:**

Example 1 (python):
```python
kernels.geglu.geglu_backward(grad_output, gate, up)
```

Example 2 (python):
```python
kernels.geglu.geglu_forward(gate, up)
```

---

## utils.callbacks.profiler

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.profiler.html

**Contents:**
- utils.callbacks.profiler
- Classes
  - PytorchProfilerCallback

utils.callbacks.profiler

HF Trainer callback for creating pytorch profiling snapshots

PyTorch Profiler callback to create snapshots of GPU memory usage at specified steps.

**Examples:**

Example 1 (python):
```python
utils.callbacks.profiler.PytorchProfilerCallback(
    steps_to_profile=5,
    profiler_steps_start=0,
)
```

---

## kernels.lora

**URL:** https://docs.axolotl.ai/docs/api/kernels.lora.html

**Contents:**
- kernels.lora
- Classes
  - LoRA_MLP
    - Methods
      - backward
        - Parameters
        - Returns
      - forward
        - Parameters
        - Returns

Module for definition of Low-Rank Adaptation (LoRA) Triton kernels.

See “LoRA: Low-Rank Adaptation of Large Language Models” (https://arxiv.org/abs/2106.09685).

Credit to unsloth (https://unsloth.ai/) for inspiration for this implementation.

Optimized LoRA MLP implementation.

Performs backward pass computation for LoRA MLP.

Forward pass for LoRA MLP.

Optimized LoRA implementation for output projection.

Backward pass computing gradients for LoRA output projection.

Forward pass for output projection with LoRA.

Optimized LoRA QKV implementation with quantization support.

Implements efficient computation of query, key, value projections with LoRA, supporting quantization and memory optimization.

Backward pass computing gradients for LoRA QKV.

Forward pass computing Q, K, V projections with LoRA.

Applies LoRA to MLP layer with GEGLU activation.

Applies LoRA to MLP layer with SwiGLU activation.

Applies LoRA to output projection layer.

Applies LoRA to compute Query, Key, Value projections.

Gets LoRA parameters from a projection module.

Efficient fused matmul + LoRA computation.

**Examples:**

Example 1 (python):
```python
kernels.lora.LoRA_MLP()
```

Example 2 (python):
```python
kernels.lora.LoRA_MLP.backward(ctx, grad_output)
```

Example 3 (python):
```python
kernels.lora.LoRA_MLP.forward(
    ctx,
    X,
    gate_weight,
    gate_bias,
    gate_quant,
    gate_A,
    gate_B,
    gate_scale,
    up_weight,
    up_bias,
    up_quant,
    up_A,
    up_B,
    up_scale,
    down_weight,
    down_bias,
    down_quant,
    down_A,
    down_B,
    down_scale,
    activation_fn,
    activation_fn_backward,
    inplace=True,
)
```

Example 4 (python):
```python
kernels.lora.LoRA_O()
```

---

## monkeypatch.trainer_fsdp_optim

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.trainer_fsdp_optim.html

**Contents:**
- monkeypatch.trainer_fsdp_optim
- Functions
  - patch_training_loop_for_fsdp

monkeypatch.trainer_fsdp_optim

fix for FSDP optimizer save in trainer w 4.47.0

monkeypatch for fixing the training loop for fsdp with optimizer save

**Examples:**

Example 1 (python):
```python
monkeypatch.trainer_fsdp_optim.patch_training_loop_for_fsdp()
```

---

## utils.schemas.multimodal

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.multimodal.html

**Contents:**
- utils.schemas.multimodal
- Classes
  - MultiModalConfig
    - Methods
      - convert_image_resize_algorithm

utils.schemas.multimodal

Pydantic models for multimodal-related configuration

Multi-modal configuration subset

Convert the image resize algorithm to a PIL.Image.Resampling enum.

**Examples:**

Example 1 (python):
```python
utils.schemas.multimodal.MultiModalConfig()
```

Example 2 (python):
```python
utils.schemas.multimodal.MultiModalConfig.convert_image_resize_algorithm(
    image_resize_algorithm,
)
```

---

## prompt_strategies.dpo.llama3

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.llama3.html

**Contents:**
- prompt_strategies.dpo.llama3
- Functions
  - argilla_chat
  - icr
  - intel
  - ultra

prompt_strategies.dpo.llama3

DPO strategies for llama-3 chat template

for argilla/dpo-mix-7k conversations

chatml transforms for datasets with system, input, chosen, rejected ex. https://huggingface.co/datasets/argilla/distilabel-intel-orca-dpo-pairs

For Intel Orca DPO Pairs

for ultrafeedback binarized conversations

**Examples:**

Example 1 (python):
```python
prompt_strategies.dpo.llama3.argilla_chat(cfg, **kwargs)
```

Example 2 (python):
```python
prompt_strategies.dpo.llama3.icr(cfg, **kwargs)
```

Example 3 (python):
```python
prompt_strategies.dpo.llama3.intel(cfg, **kwargs)
```

Example 4 (python):
```python
prompt_strategies.dpo.llama3.ultra(cfg, **kwargs)
```

---

## core.chat.format.shared

**URL:** https://docs.axolotl.ai/docs/api/core.chat.format.shared.html

**Contents:**
- core.chat.format.shared

core.chat.format.shared

shared functions for format transforms

---

## monkeypatch.llama_expand_mask

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.llama_expand_mask.html

**Contents:**
- monkeypatch.llama_expand_mask

monkeypatch.llama_expand_mask

expands the binary attention mask per 3.2.2 of https://arxiv.org/pdf/2107.02027.pdf

---

## core.chat.messages

**URL:** https://docs.axolotl.ai/docs/api/core.chat.messages.html

**Contents:**
- core.chat.messages
- Classes
  - ChatFormattedChats
  - Chats
  - MessageContentTypes
  - MessageContents
  - MessageRoles
  - Messages
  - PreferenceChats
  - SpecialToken

internal message representations of chat messages

Chat formatted chats with formatter and optional train on inputs

top level data structure for chat conversations

Message content types for text, image, audio, tool calls, and tool responses

Message contents with type, value, metadata, weight, newline, and end of contents

Message roles for the system, user, assistant, and tools

Messages with role, content, metadata, weight, and chat formatting

representation for preference data for chat

Special tokens for beginning of string and end of string

Tool with description, function, and parameters

Tool call contents with name, arguments, and optional id

Tool call function with name and arguments

Tool response contents with name, content, and optional id

**Examples:**

Example 1 (python):
```python
core.chat.messages.ChatFormattedChats()
```

Example 2 (python):
```python
core.chat.messages.Chats()
```

Example 3 (python):
```python
core.chat.messages.MessageContentTypes()
```

Example 4 (python):
```python
core.chat.messages.MessageContents()
```

---

## core.datasets.transforms.chat_builder

**URL:** https://docs.axolotl.ai/docs/api/core.datasets.transforms.chat_builder.html

**Contents:**
- core.datasets.transforms.chat_builder
- Functions
  - chat_message_transform_builder
    - Parameters
    - Returns

core.datasets.transforms.chat_builder

This module contains a function that builds a transform that takes a row from the dataset and converts it to a Chat.

Builds a transform that takes a row from the dataset and converts it to a Chat

**Examples:**

Example 1 (python):
```python
core.datasets.transforms.chat_builder.chat_message_transform_builder(
    train_on_inputs=False,
    conversations_field='messages',
    message_field_role=None,
    message_field_content=None,
    message_field_training=None,
)
```

---

## utils.chat_templates

**URL:** https://docs.axolotl.ai/docs/api/utils.chat_templates.html

**Contents:**
- utils.chat_templates

This module provides functionality for selecting chat templates based on user choices. These templates are used for formatting messages in a conversation.

---

## core.trainers.dpo.trainer

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.dpo.trainer.html

**Contents:**
- core.trainers.dpo.trainer
- Classes
  - AxolotlDPOTrainer
    - Methods
      - push_to_hub

core.trainers.dpo.trainer

DPO trainer for axolotl

Extend the base DPOTrainer for axolotl helpers.

Overwrite the push_to_hub method in order to force-add the tags when pushing the model on the Hub. Please refer to ~transformers.Trainer.push_to_hub for more details.

**Examples:**

Example 1 (python):
```python
core.trainers.dpo.trainer.AxolotlDPOTrainer(*args, dataset_tags=None, **kwargs)
```

Example 2 (python):
```python
core.trainers.dpo.trainer.AxolotlDPOTrainer.push_to_hub(*args, **kwargs)
```

---

## monkeypatch.gradient_checkpointing.offload_disk

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.gradient_checkpointing.offload_disk.html

**Contents:**
- monkeypatch.gradient_checkpointing.offload_disk
- Classes
  - Disco
    - Methods
      - backward
      - forward
      - get_instance
  - DiskOffloadManager
    - Methods
      - cleanup

monkeypatch.gradient_checkpointing.offload_disk

DISCO - DIsk-based Storage and Checkpointing with Optimized prefetching

Disco: DIsk-based Storage and Checkpointing with Optimized prefetching Advanced disk-based gradient checkpointer with prefetching.

Backward pass that loads activations from disk with prefetching

Forward pass that offloads activations to disk asynchronously

Get or create the offload manager

Manages offloaded tensors and handles prefetching in a separate thread. Includes synchronization to prevent race conditions.

Clean up all temp files and stop prefetch thread with proper synchronization

Clean up a specific tensor file after it’s been used

Load tensor from disk or prefetch cache with proper synchronization

Save tensor to disk asynchronously and return file path with thread-safe operations

Trigger prefetching of the next N tensors with proper synchronization

Wait for a tensor to be saved to disk

**Examples:**

Example 1 (python):
```python
monkeypatch.gradient_checkpointing.offload_disk.Disco()
```

Example 2 (python):
```python
monkeypatch.gradient_checkpointing.offload_disk.Disco.backward(
    ctx,
    *grad_outputs,
)
```

Example 3 (python):
```python
monkeypatch.gradient_checkpointing.offload_disk.Disco.forward(
    ctx,
    forward_function,
    hidden_states,
    *args,
    prefetch_size=1,
    prefetch_to_gpu=True,
    save_workers=4,
)
```

Example 4 (python):
```python
monkeypatch.gradient_checkpointing.offload_disk.Disco.get_instance(
    prefetch_size=1,
    prefetch_to_gpu=True,
    save_workers=4,
)
```

---

## utils.samplers.multipack

**URL:** https://docs.axolotl.ai/docs/api/utils.samplers.multipack.html

**Contents:**
- utils.samplers.multipack
- Classes
  - MultipackBatchSampler
    - Methods
      - efficiency
      - gather_efficiency
        - Returns
      - gather_len_batches
      - generate_batches
        - Parameters

utils.samplers.multipack

Multipack Batch Sampler - An efficient batch sampler for packing variable-length sequences into fixed-capacity batches to optimize memory usage and training throughput.

Batch sampler class for efficient packing of variable-length sequences

This sampler packs sequences into fixed-capacity bins (batches) to maximize GPU memory utilization and training throughput by reducing padding.

It supports both parallel packing (using FFD algorithm) and sequential packing (preserving original sequence order).

Calculate the packing efficiency (ratio of tokens used to total token slots). Higher is better - 1.0 would mean perfect packing with no wasted space.

Gather and synchronize packing efficiency estimates across all distributed ranks.

Gather and synchronize batch counts across all distributed ranks. Returns the minimum number of batches available on any rank.

Generate packed batches for training.

Set the epoch number, used for reproducible shuffling across epochs

Sequential allocator that preserves example order.

First-fit-decreasing bin packing algorithm check.

Checks if sequences with the given lengths could fit in the specified number of bins.

Pack a group of sequences into bins using First-Fit Decreasing algorithm.

Pack sequences into bins using parallel processing.

Returns: List of bins, where each bin contains indices of sequences assigned to it.

**Examples:**

Example 1 (python):
```python
utils.samplers.multipack.MultipackBatchSampler(
    sampler,
    batch_size,
    batch_max_len,
    lengths,
    packing_efficiency_estimate=1.0,
    drop_last=True,
    num_count_samples=4,
    sequential=False,
    group_size=100000,
    bin_size=200,
    num_processes=None,
    safe_mode=True,
    mp_start_method='fork',
    **kwargs,
)
```

Example 2 (python):
```python
utils.samplers.multipack.MultipackBatchSampler.efficiency()
```

Example 3 (python):
```python
utils.samplers.multipack.MultipackBatchSampler.gather_efficiency()
```

Example 4 (python):
```python
utils.samplers.multipack.MultipackBatchSampler.gather_len_batches(num)
```

---

## core.trainers.mixins.scheduler

**URL:** https://docs.axolotl.ai/docs/api/core.trainers.mixins.scheduler.html

**Contents:**
- core.trainers.mixins.scheduler
- Classes
  - SchedulerMixin
    - Methods
      - create_scheduler
        - Parameters

core.trainers.mixins.scheduler

Module for Axolotl trainer scheduler mixin

Mixin class for scheduler setup in CausalTrainer.

Set up the scheduler. The optimizer of the trainer must have been set up either before this method is called or passed as an argument.

**Examples:**

Example 1 (python):
```python
core.trainers.mixins.scheduler.SchedulerMixin()
```

Example 2 (python):
```python
core.trainers.mixins.scheduler.SchedulerMixin.create_scheduler(
    num_training_steps,
    optimizer=None,
)
```

---

## utils.collators.batching

**URL:** https://docs.axolotl.ai/docs/api/utils.collators.batching.html

**Contents:**
- utils.collators.batching
- Classes
  - BatchSamplerDataCollatorForSeq2Seq
  - DataCollatorForSeq2Seq
    - Parameters
  - PretrainingBatchSamplerDataCollatorForSeq2Seq
  - V2BatchSamplerDataCollatorForSeq2Seq

utils.collators.batching

Data collators for axolotl to pad labels and position_ids for packed sequences

Collator for multipack specific to the using the BatchSampler

Data collator that will dynamically pad the inputs received, as well as the labels and position_ids

Collator for multipack specific to the using the BatchSampler

Collator for multipack specific to the using the BatchSampler

**Examples:**

Example 1 (python):
```python
utils.collators.batching.BatchSamplerDataCollatorForSeq2Seq(
    tokenizer,
    model=None,
    padding=True,
    max_length=None,
    pad_to_multiple_of=None,
    label_pad_token_id=-100,
    position_pad_token_id=0,
    return_tensors='pt',
)
```

Example 2 (python):
```python
utils.collators.batching.DataCollatorForSeq2Seq(
    tokenizer,
    model=None,
    padding=True,
    max_length=None,
    pad_to_multiple_of=None,
    label_pad_token_id=-100,
    position_pad_token_id=0,
    return_tensors='pt',
)
```

Example 3 (python):
```python
utils.collators.batching.PretrainingBatchSamplerDataCollatorForSeq2Seq(
    *args,
    multipack_attn=True,
    **kwargs,
)
```

Example 4 (python):
```python
utils.collators.batching.V2BatchSamplerDataCollatorForSeq2Seq(
    tokenizer,
    model=None,
    padding=True,
    max_length=None,
    pad_to_multiple_of=None,
    label_pad_token_id=-100,
    position_pad_token_id=0,
    return_tensors='pt',
    squash_position_ids=False,
)
```

---

## prompt_strategies.orcamini

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.orcamini.html

**Contents:**
- prompt_strategies.orcamini
- Classes
  - OrcaMiniPrompter

prompt_strategies.orcamini

Prompt Strategy for finetuning Orca Mini (v2) models see also https://huggingface.co/psmathur/orca_mini_v2_7b for more information

Use dataset type: orcamini in config.yml to use this prompt style.

Compared to the alpaca_w_system.open_orca dataset type, this one specifies the system prompt with “### System:”.

Not suited/tested for multiple-turn conversations without further adjustments.

Adjusted Prompter for Orca Mini (v2) datasets

**Examples:**

Example 1 (python):
```python
prompt_strategies.orcamini.OrcaMiniPrompter(
    prompt_style=PromptStyle.INSTRUCT.value,
)
```

---

## prompt_strategies.dpo.chat_template

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.dpo.chat_template.html

**Contents:**
- prompt_strategies.dpo.chat_template
- Functions
  - argilla_chat
    - Parameters
    - Returns
    - Dataset format

prompt_strategies.dpo.chat_template

DPO prompt strategies for using tokenizer chat templates.

DPO chat template strategy for argilla-style datasets.

For argilla-style datasets where chosen/rejected contain full conversations instead of single response messages. Extracts the conversation history from the chosen field and formats both chosen/rejected responses using the configured chat template.

{ “chosen”: [ {“role”: “user”, “content”: “…”}, {“role”: “assistant”, “content”: “…”} ], “rejected”: [ {“role”: “user”, “content”: “…”}, {“role”: “assistant”, “content”: “…”} ] }

**Examples:**

Example 1 (python):
```python
prompt_strategies.dpo.chat_template.argilla_chat(cfg, dataset_idx=0, **kwargs)
```

---

## monkeypatch.relora

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.relora.html

**Contents:**
- monkeypatch.relora
- Classes
  - ReLoRACallback

Implements the ReLoRA training procedure from https://arxiv.org/abs/2307.05695, minus the initial full fine-tune.

Callback to merge LoRA weights into the base model and save full-weight checkpoints

**Examples:**

Example 1 (python):
```python
monkeypatch.relora.ReLoRACallback(cfg)
```

---

## monkeypatch.transformers_fa_utils

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.transformers_fa_utils.html

**Contents:**
- monkeypatch.transformers_fa_utils
- Functions
  - fixed_fa_peft_integration_check
    - Parameters

monkeypatch.transformers_fa_utils

see https://github.com/huggingface/transformers/pull/35834

PEFT usually casts the layer norms in float32 for training stability reasons therefore the input hidden states gets silently casted in float32. Hence, we need cast them back in float16 / bfloat16 just to be sure everything works as expected. This might slowdown training & inference so it is recommended to not cast the LayerNorms!

**Examples:**

Example 1 (python):
```python
monkeypatch.transformers_fa_utils.fixed_fa_peft_integration_check(
    query,
    key,
    value,
    target_dtype=None,
    preferred_dtype=None,
)
```

---

## utils.collators.mm_chat

**URL:** https://docs.axolotl.ai/docs/api/utils.collators.mm_chat.html

**Contents:**
- utils.collators.mm_chat
- Classes
  - MultiModalChatDataCollator

utils.collators.mm_chat

Collators for multi-modal chat messages and packing

Collator for multi-modal chat messages

**Examples:**

Example 1 (python):
```python
utils.collators.mm_chat.MultiModalChatDataCollator(
    tokenizer,
    processing_strategy,
    packing=False,
    return_tensors='pt',
    padding=True,
    pad_to_multiple_of=None,
)
```

---

## utils.lora

**URL:** https://docs.axolotl.ai/docs/api/utils.lora.html

**Contents:**
- utils.lora
- Functions
  - get_lora_merged_state_dict
    - Parameters
    - Returns

module to get the state dict of a merged lora model

Create and return a state_dict that has the LoRA deltas merged into the base model’s weights, without modifying model in place.

**Examples:**

Example 1 (python):
```python
utils.lora.get_lora_merged_state_dict(model)
```

---

## utils.model_shard_quant

**URL:** https://docs.axolotl.ai/docs/api/utils.model_shard_quant.html

**Contents:**
- utils.model_shard_quant
- Functions
  - load_and_quantize

utils.model_shard_quant

module to handle loading model on cpu/meta device for FSDP

Loads value tensor into submodule of module, optionally skipping skip_names and converting to dtype.

Quantizes Params4bit on device then places on “cpu” if to_cpu=True or “meta” if to_meta=True.

**Examples:**

Example 1 (python):
```python
utils.model_shard_quant.load_and_quantize(
    module,
    name,
    value,
    device=None,
    dtype=None,
    skip_names=None,
    to_cpu=False,
    to_meta=False,
    verbose=False,
    quant_method='bnb',
)
```

---

## monkeypatch.gradient_checkpointing.offload_cpu

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.gradient_checkpointing.offload_cpu.html

**Contents:**
- monkeypatch.gradient_checkpointing.offload_cpu
- Classes
  - CPU_Offloaded_Gradient_Checkpointer

monkeypatch.gradient_checkpointing.offload_cpu

CPU offloaded checkpointing

Saves VRAM by smartly offloading to RAM. Tiny hit to performance, since we mask the movement via non blocking calls.

**Examples:**

Example 1 (python):
```python
monkeypatch.gradient_checkpointing.offload_cpu.CPU_Offloaded_Gradient_Checkpointer(
)
```

---

## core.builders.base

**URL:** https://docs.axolotl.ai/docs/api/core.builders.base.html

**Contents:**
- core.builders.base
- Classes
  - TrainerBuilderBase
    - Methods
      - get_post_trainer_create_callbacks

Base class for trainer builder

Base class for trainer builder.

Callbacks added after the trainer is created, usually b/c these need access to the trainer

**Examples:**

Example 1 (python):
```python
core.builders.base.TrainerBuilderBase(cfg, model, tokenizer, processor=None)
```

Example 2 (python):
```python
core.builders.base.TrainerBuilderBase.get_post_trainer_create_callbacks(trainer)
```

---

## core.builders.rl

**URL:** https://docs.axolotl.ai/docs/api/core.builders.rl.html

**Contents:**
- core.builders.rl
- Classes
  - HFRLTrainerBuilder

Builder for RLHF trainers

Trainer factory class for TRL-based RLHF trainers (e.g. DPO)

**Examples:**

Example 1 (python):
```python
core.builders.rl.HFRLTrainerBuilder(cfg, model, tokenizer, processor=None)
```

---

## utils.schemas.integrations

**URL:** https://docs.axolotl.ai/docs/api/utils.schemas.integrations.html

**Contents:**
- utils.schemas.integrations
- Classes
  - CometConfig
  - GradioConfig
  - LISAConfig
  - MLFlowConfig
  - OpenTelemetryConfig
  - RayConfig
  - WandbConfig

utils.schemas.integrations

Pydantic models for Axolotl integrations

Comet configuration subset

Gradio configuration subset

LISA configuration subset

MLFlow configuration subset

OpenTelemetry configuration subset

Ray launcher configuration subset

Wandb configuration subset

**Examples:**

Example 1 (python):
```python
utils.schemas.integrations.CometConfig()
```

Example 2 (python):
```python
utils.schemas.integrations.GradioConfig()
```

Example 3 (python):
```python
utils.schemas.integrations.LISAConfig()
```

Example 4 (python):
```python
utils.schemas.integrations.MLFlowConfig()
```

---

## utils.data.sft

**URL:** https://docs.axolotl.ai/docs/api/utils.data.sft.html

**Contents:**
- utils.data.sft
- Functions
  - prepare_datasets
    - Parameters
    - Returns

Data handling specific to SFT.

Prepare training and evaluation datasets based on configuration.

**Examples:**

Example 1 (python):
```python
utils.data.sft.prepare_datasets(cfg, tokenizer, processor=None)
```

---

## integrations.liger.args

**URL:** https://docs.axolotl.ai/docs/api/integrations.liger.args.html

**Contents:**
- integrations.liger.args
- Classes
  - LigerArgs

integrations.liger.args

Module for handling LIGER input arguments.

Input args for LIGER.

**Examples:**

Example 1 (python):
```python
integrations.liger.args.LigerArgs()
```

---

## monkeypatch.mixtral

**URL:** https://docs.axolotl.ai/docs/api/monkeypatch.mixtral.html

**Contents:**
- monkeypatch.mixtral

Patches to support multipack for mixtral

---

## cli.preprocess

**URL:** https://docs.axolotl.ai/docs/api/cli.preprocess.html

**Contents:**
- cli.preprocess
- Functions
  - do_cli
    - Parameters
  - do_preprocess
    - Parameters

CLI to run preprocessing of a dataset.

Parses axolotl config, CLI args, and calls do_preprocess.

Preprocesses dataset specified in axolotl config.

**Examples:**

Example 1 (python):
```python
cli.preprocess.do_cli(config=Path('examples/'), **kwargs)
```

Example 2 (python):
```python
cli.preprocess.do_preprocess(cfg, cli_args)
```

---

## prompt_strategies.kto.llama3

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.kto.llama3.html

**Contents:**
- prompt_strategies.kto.llama3
- Functions
  - argilla_chat
  - intel
  - ultra

prompt_strategies.kto.llama3

KTO strategies for llama-3 chat template

for argilla/kto-mix-15k conversations

For Intel Orca KTO ex: argilla/distilabel-intel-orca-kto

for ultrafeedback binarized conversations ex: argilla/ultrafeedback-binarized-preferences-cleaned-kto

**Examples:**

Example 1 (python):
```python
prompt_strategies.kto.llama3.argilla_chat(cfg, **kwargs)
```

Example 2 (python):
```python
prompt_strategies.kto.llama3.intel(cfg, **kwargs)
```

Example 3 (python):
```python
prompt_strategies.kto.llama3.ultra(cfg, **kwargs)
```

---

## prompt_strategies.orpo.chat_template

**URL:** https://docs.axolotl.ai/docs/api/prompt_strategies.orpo.chat_template.html

**Contents:**
- prompt_strategies.orpo.chat_template
- Classes
  - Message
  - MessageList
  - ORPODatasetParsingStrategy
    - Methods
      - get_chosen_conversation_thread
      - get_prompt
      - get_rejected_conversation_thread
  - ORPOPrompter

prompt_strategies.orpo.chat_template

chatml prompt tokenization strategy for ORPO

Strategy to parse chosen rejected dataset into messagelist

Dataset structure mappings

Map the data to extract everything up to the last turn

Dataset structure mappings

Single Turn prompter for ORPO

rejected_input_ids input_ids rejected_attention_mask attention_mask rejected_labels labels

chatml transforms for datasets with system, input, chosen, rejected

**Examples:**

Example 1 (python):
```python
prompt_strategies.orpo.chat_template.Message()
```

Example 2 (python):
```python
prompt_strategies.orpo.chat_template.MessageList()
```

Example 3 (python):
```python
prompt_strategies.orpo.chat_template.ORPODatasetParsingStrategy()
```

Example 4 (python):
```python
prompt_strategies.orpo.chat_template.ORPODatasetParsingStrategy.get_chosen_conversation_thread(
    prompt,
)
```

---

## loaders.processor

**URL:** https://docs.axolotl.ai/docs/api/loaders.processor.html

**Contents:**
- loaders.processor

Processor loading functionality for multi-modal models

---

## utils.callbacks.comet_

**URL:** https://docs.axolotl.ai/docs/api/utils.callbacks.comet_.html

**Contents:**
- utils.callbacks.comet_
- Classes
  - SaveAxolotlConfigtoCometCallback

utils.callbacks.comet_

Comet module for trainer callbacks

Callback to save axolotl config to comet

**Examples:**

Example 1 (python):
```python
utils.callbacks.comet_.SaveAxolotlConfigtoCometCallback(axolotl_config_path)
```

---
