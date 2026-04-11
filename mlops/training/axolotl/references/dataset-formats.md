# Axolotl - Dataset-Formats

**Pages:** 9

---

## Custom Pre-Tokenized Dataset

**URL:** https://docs.axolotl.ai/docs/dataset-formats/tokenized.html

**Contents:**
- Custom Pre-Tokenized Dataset

**Examples:**

Example 1 (yaml):
```yaml
datasets:
  - path: /path/to/your/file.jsonl
    ds_type: json
    type:
```

Example 2 (json):
```json
{"input_ids":[271,299,99],"attention_mask":[1,1,1],"labels":[271,-100,99]}
{"input_ids":[87,227,8383,12],"attention_mask":[1,1,1,1],"labels":[87,227,8383,12]}
```

---

## Dataset Formats

**URL:** https://docs.axolotl.ai/docs/dataset-formats/index.html

**Contents:**
- Dataset Formats
- Pre-training
  - Pre-training from Hugging Face hub datasets
  - Pre-training from local dataset files
  - Pre-training without streaming
  - Pre-training dataset configuration tips
    - Setting max_steps
    - Group_by_length
  - Reference
- Supervised fine-tuning (SFT)

Axolotl is a training framework that aims to make the process convenient yet flexible to users by simply passing a config yaml file.

As there are a lot of available options in Axolotl, this guide aims to provide an simplify the user experience to choosing the proper choice.

Axolotl supports 3 kinds of training methods: pre-training, supervised fine-tuning, and preference-based post-training (e.g. DPO, ORPO, PRMs). Each method has their own dataset format which are described below.

This guide will mainly use JSONL as an introduction. Please refer to the dataset loading docs to understand how to load datasets from other sources.

For pretraining_dataset: specifically, please refer to the Pre-training section.

When aiming to train on large corpora of text datasets, pre-training is your go-to choice. Due to the size of these datasets, downloading the entire-datasets before beginning training would be prohibitively time-consuming. Axolotl supports streaming to only load batches into memory at a time.

A sample format for a pre-training dataset is as follows:

It is typically recommended to save your dataset as .jsonl due to its flexibility and simplicity.

Axolotl supports loading from a Hugging Face hub repo or from local files.

As an example, to train using a Hugging Face dataset hf_org/name, you can pass the following config:

Given a few corpus files: A.jsonl, B.jsonl, and C.jsonl, your config will look like the below:

While we recommend .jsonl, you can also use the other formats (csv, parquet, arrow, SQL, Webdataset) that are supported by Dataset.load_dataset

In the case that the dataset is small and can be loaded entirely into memory, another approach to running pre-training is to use the completion format. This would mean that the entire dataset is pre-tokenized instead of on-demand in streaming.

One benefit of this is that the tokenization can be performed separately on a CPU-only machine, and then transferred to a GPU machine for training to save costs.

For completion only, Axolotl would split texts if it exceeds the context length into multiple smaller prompts. If you are interested in having this for pretraining_dataset too, please let us know or help make a PR!

When using streaming for large datasets, Axolotl does not know in advance how large the dataset is and does not know when to stop.

Therefore, it is necessary to set max_steps: int in your config for pre-training to run, so that Axolotl knows when to stop training.

One step is equal to sequence_len * micro_batch_size * gradient_accumulation_steps * total_num_gpus tokens.

It is recommended to leave this off if downloading from Hugging Face hub as it would download the entire dataset which can be very large.

Please see docs here.

Supervised fine-tuning is the process of training models to respond to an instruction or chat input.

As there are a wide variety of dataset formats, Axolotl tries to support a majority of the formats available in public datasets.

Axolotl provides four approaches for loading datasets, however, it’s easier to work backwards from the dataset you have available to figure out which approach to use.

A flow chart is as follows:

Do you already have the dataset tokenized? If yes, check Pre-Tokenized Dataset.

Do you want to format the dataset yourself and manually choose each section to mask? If yes, check Template Free Dataset

Is your dataset in a “conversation” format, containing a list[messages]? If yes, check Conversation Dataset

Is your dataset in an “instruct” format, containing { instruction, response }? If yes, check Instruction Dataset

If you went through the flow chart and did not find one that matches, it is recommended to preprocess your dataset into one of the above or create a thread on Github Discussion.

You can mix and match within each approach or across approaches to train a model on a variety of datasets.

We suggest this approach when you want to bring your own tokenized dataset.

Axolotl expects the dataset to have three keys:

Make sure to add BOS/EOS tokens to your prompt and mask it appropriately.

A config for this would look like:

Reference: Pre-Tokenized Dataset Documentation.

We recommend this approach when you want granular control over the prompt formatting, special tokens, and masking, whilst letting Axolotl handle the tokenization. This is very useful if your dataset has unique prompts that differ across samples and where one single general template wouldn’t suffice.

In the example below, you could see that there is no proper structure. At the same time, it’s very flexible as there are no constraints on how your prompt can look.

Each prompt must be have a key called segments which is a list of { text, label }.

Reference: Template Free Documentation.

conversation messages are a list of messages which usually contain a role and content key.

Fun fact: Axolotl synonymously refers to “chat” messages as conversation messages due to how FastChat initially used this term to build a widely used fastchat conversation method for formatting chat messages prior to the creation of chat_templates.

The current most popular and convenient method for inference is to use chat_templates for formatting prompts. Axolotl supports using chat_templates for training to ensure that the model performs in the same environment as in inference.

Here’s a quick rundown on chat_template: A chat_template is a Jinja2 template which formats a list of messages into a prompt.

An example of a prompt formatted into a popular template called ChatML can be seen below:

Single prompt (pretty-printed):

The ChatML template is as follows:

The above prompt formatted into this template will result in:

By using delimiters (<|im_start|> and <|im_end|>), a prompt separates different speakers which helps the model identify which portion belongs to whom.

Older conversation datasets with the following format are colloquially called sharegpt datasets.

Newer conversation datasets usually follow the OpenAI format.

Axolotl supports both as well as allowing customization of any kind of key.

To properly use this method, it is important to identify three things:

Which chat_template would you use?

What are the keys in your dataset, and what are the possible roles? For example, in OpenAI format, the keys would be messages, role, and content, respectively, whereas the possible roles are system, user, and assistant.

What do you want to mask? For instance, only assistant messages, only last message, or nothing.

There are a lot of chat_templates out there. Axolotl supports the common ones: supported chat templates. For example, to use ChatML, it would be chat_template: chatml.

However, it is also possible to use the already configured template within the tokenizer by specifying chat_template: tokenizer_default. If you want a fallback (in case some tokenizer does not have it pre-configured), you can do chat_template: tokenizer_default_fallback_chatml to fallback to the ChatML template if a tokenizer template was not found.

One last but powerful approach is to bring your own template. This can be set via:

We currently default to OpenAI format for dataset keys, so if that’s your current dataset format, there’s nothing to do here.

If your dataset format is different, here are the keys you should check (with their defaults):

In some chat_templates (e.g. Gemma), the roles are hardcoded to user and assistant. Consequently, you may find it necessary to map the roles in your dataset to these above. We currently have some defaults that should work for common datasets, but if you get a KeyError, it would be necessary to add mapping for your roles. Here is an example of how it would look like:

In the example above, all gpt and model values are converted to assistant. All human values are converted to user.

The common use case for chat_template is for chat messages, therefore, it is common to mask all non-assistant messages. Assistant messages refer to the bot messages that you want the model to learn on.

To train on all assistant messages, you would set the following configs.

The train_on_eos config means that it would mask all EOS tokens for turns that aren’t assistant-turns. The other options are: all and last to choose which EOS to train on.

Perhaps, you want to train on assistant and narrator roles, you can simply add narrator to the list of roles_to_train. You would also need to add it to the mapping of roles above.

As chat_templates may use hardcoded EOS/EOT tokens that are different from the tokenizer’s EOS, it is highly recommended to set them. For example, ChatML uses <|im_end|> to end turns.

Once all the above steps are completed, you could combine all these configs together to form a bespoke configuration for your custom dataset.

If this config were to be applied to the sample dataset above, the output would look as such (which can be retrieved via axolotl preprocess config.yaml --debug):

The first number refers to the label, the second refers to the token_id. For example, -100 labels appear on non-assistant portions, meaning that they are masked during. For assistant portions, the label is the same as the token_id.

If during preprocess, there are a lot of warnings of Could not find content __ boundary, please check the FAQ section for chat_templates.

Please see docs here.

Instruction datasets are used to train instruction-following models and comprise a prompt, containing an instruction, and a single response. In contrast to chat datasets which may be multi-turn, instruct datasets are typically single-turn.

An example is of a common format called Alpaca:

Using those keys, a prompt can be built based on it.

This can be configured as such:

Axolotl supports many kinds of instruction dataset. All of them can be found in the Instruction Dataset Documentation with their respective type and sample row format.

Due to the myriad possibilities of instruction formats, Axolotl allows customizing your own instruction format without having to dive into the code directly.

In the example below, a sample row is used to output in mistral_v1 format.

The config sets that the field_instruction is actually named input, and the field_input is empty as we don’t have an input in this sample. Generally, instruction can be thought as the question to the model, and input as the additional information with output being the response. It is not necessary to have an input nor system. In the end, the most important part is to understand what format you want it to look like and how you can customize this to your use case.

Reference: Custom Instruct Prompt Format Documentation.

As there are multiple RLHF methods with their own dataset requirements. Please see RLHF documentation for more detail.

**Examples:**

Example 1 (json):
```json
{"text": "first row"}
{"text": "second row"}
...
```

Example 2 (yaml):
```yaml
pretraining_dataset: hf_org/name
```

Example 3 (yaml):
```yaml
pretraining_dataset:
  - path: json
    data_files:
      - A.jsonl
      - B.jsonl
      - C.jsonl
```

Example 4 (yaml):
```yaml
datasets:
  - path: hf_org/name
    type: completion
```

---

## Conversation

**URL:** https://docs.axolotl.ai/docs/dataset-formats/conversation.html

**Contents:**
- Conversation
- chat_template
  - Migrating from sharegpt
  - Examples
    - Training on last message
    - Overriding default chat template
    - Using default chat template with fallback
    - Custom Jinja template
    - Using template with different token for EOT and EOS
    - Using tool use

Chat Template strategy uses a jinja2 template that converts a list of messages into a prompt. Support using tokenizer’s template, a supported template, or custom jinja2.

See configs for full configs and supported templates.

Most configs can be adapted as follows:

We recommend checking the below examples for other usecases.

(Legacy) Using the default chat template in the tokenizer_config.json on OpenAI messages format, training on only last message.

If you receive an error like “chat_template choice is tokenizer_default but tokenizer’s chat_template is null.”, it means the tokenizer does not have a default chat_template. Follow the examples below instead to set a custom chat_template.

Using the gemma chat template to override the tokenizer_config.json’s chat template on OpenAI messages format, training on all assistant messages.

If you want to use built-in chat_template, use chat_template: tokenizer_default (this is set by default).

Using the tokenizer_config.json’s chat template or chatml as fallback if the former’s chat template does not exist, on OpenAI messages format, training on all assistant messages.

Using a custom jinja template on OpenAI messages format, training on all assistant messages.

Please make sure that your tokenizer.eos_token is same as EOS (End-of-Sequence) token in template. Otherwise, set eos_token under special_tokens:.

See config documentation for detailed explanations of “turn”, “last”, and “all” options for training on tokens.

Using eot_tokens requires each token that exists in chat_template to be a single token in the tokenizer. Otherwise, the tokenizer will split the token and cause unexpected behavior.

You can add those tokens as new tokens under tokens: or (recommended) override unused added_tokens via added_tokens_overrides:. See config for more details.

If EOS token only appears at the end of a prompt, train_on_eos: last is equivalent to train_on_eos: turn. Therefore, generally, you can leave them to their defaults and omit them.

Instead of passing tools via the system prompt, an alternative method would be to have the tools in a separate column and loaded via chat_template to let the template dynamically build it.

Tools need to follow JSON schema.

If you have tool arguments with same name but different dtypes (like "time": string and "time": number), please save arguments: as JSON string to prevent datasets from having casting issues.

Example config for Llama4:

Look into the chat_template you are using to see if it supports tools and what the expected role is for the tool answer. In the example above, the tool answer is expected to be in the tool or ipython role for llama4 template.

(Advanced) Using fine-grained control over tokens and turns to train in a conversation

For a data sample that looks like:

The configuration would look like:

It is not necessary to set both message_field_training and message_field_training_detail at once.

(For Qwen3 template only) Enable reasoning split, where the reasoning is split from the content and passed as a separate field into the template.

For example, a content can look like:

After split, it will look like:

ShareGPT is deprecated!. Please see chat_template section.

**Examples:**

Example 1 (json):
```json
{"messages": [{"role": "...", "content": "..."}, {"role": "...", "content": "..."}, ...]}
```

Example 2 (yaml):
```yaml
# old
chat_template: chatml
datasets:
  - path: ...
    type: sharegpt
    conversation: chatml

# new (if using tokenizer's chat_template)
datasets:
  - path: ...
    type: chat_template

    field_messages: conversations
    message_property_mappings:
      role: from
      content: value

# new (if setting a new chat_template like chatml, gemma, etc)
chat_template: chatml
datasets:
  - path: ...
    type: chat_template

    field_messages: conversations
    message_property_mappings:
      role: from
      content: value
```

Example 3 (yaml):
```yaml
datasets:
  - path: ...
    type: chat_template
    roles_to_train:
    train_on_eos:
```

Example 4 (yaml):
```yaml
chat_template: gemma # this overwrites the tokenizer's chat_template
datasets:
  - path: ...
    type: chat_template
    roles_to_train: ["assistant"]  # default value
```

---

## Pre-training

**URL:** https://docs.axolotl.ai/docs/dataset-formats/pretraining.html

**Contents:**
- Pre-training

For pretraining, there is no prompt template or roles. The only required field is text:

Axolotl usually loads the entire dataset into memory. This will be challenging for large datasets. Use the following config to enable streaming:

**Examples:**

Example 1 (json):
```json
{"text": "first row"}
{"text": "second row"}
...
```

Example 2 (yaml):
```yaml
pretraining_dataset:
  - name:
    path:
    split:
    text_column: # column in dataset with the data, usually `text`
    type: pretrain
    trust_remote_code:
    skip: # number of rows of data to skip over from the beginning
```

---

## Template-Free

**URL:** https://docs.axolotl.ai/docs/dataset-formats/template_free.html

**Contents:**
- Template-Free
- Background
  - Masking Inputs
  - You may not want prompt templates
  - The input_output format
- Usage
  - 1. Prepare Data
  - 2. Use type: input_output
  - 3. Check the prompts

One of the most popular features of axolotl is setting the following configuration value:

If you declare a dataset formats such as alpaca or chatml, axolotl knows what is an input (i.e. human) vs. an output (i.e. the assistant) and masks the input labels so that your model can focus on predicting the outputs only.

However, there are many situations where you don’t want to use one of these formats or templates. This is because they can:

You can construct your prompts without a template by using the input_output format, by setting type: input_output in your configuration file like this:

Unlike type: completion, which is also template-free, type: input_output allows you to mask segments of your text. More details on how this works are described below.

This is how you can use the input_output format:

To use the input_output format, collect your data in the following format into a jsonl file (below is the first row from the file output.jsonl` pretty printed):

Set label:false when you want to mask a segment of text so that the model isn’t trained on it. Some things to keep in mind:

[!IMPORTANT] 1. EOS, BOS, spaces, newlines etc. are entirely up to you. Axolotl concatenates all the segments as-is. The tokenizer doesn’t add anything additional. Notice how I added spaces, newlines, <s> (BOS), and </s> (EOS) myself. 2. Make sure you check the materialized output to validate that the prompt is getting assembled how you like.

Let’s materialize data with our output.jsonl file by setting type: input_output in our axolotl config:

You can use the following command to materialize your data. The --debug flag will print the tokens, along with the labels so you can verify that the correct items are being ignored:

The format is decoded_token(label, token_id), for example, <s>(1, 1) means that the token is <s>, the label is 1 and the token_id is 1. When the label is -100 then that token is ignored for training.

Here is another way to check the materialized output:

We can check that the right tokens are ignored by comparing the labels to each token:

If we look at the input data, the above table seems correct! (The jsonl version is repeated below for reference):

**Examples:**

Example 1 (yaml):
```yaml
train_on_inputs: false
```

Example 2 (yaml):
```yaml
train_on_inputs: false # Mask segments of your data
datasets:
  - path: output.jsonl
    type: input_output  # use template free prompt construction
```

Example 3 (bash):
```bash
$ head -n1 output.jsonl | python -m json.tool
```

Example 4 (unknown):
```unknown
{
    "segments": [
        {
            "label": true,
            "text": "<s>Hello\n"
        },
        {
            "label": true,
            "text": "hi there!. "
        },
        {
            "label": false,
            "text": "goodbye "
        },
        {
            "label": true,
            "text": "farewell</s>"
        }
    ]
}
```

---

## Dataset Formats

**URL:** https://docs.axolotl.ai/docs/dataset-formats/

**Contents:**
- Dataset Formats
- Pre-training
  - Pre-training from Hugging Face hub datasets
  - Pre-training from local dataset files
  - Pre-training without streaming
  - Pre-training dataset configuration tips
    - Setting max_steps
    - Group_by_length
  - Reference
- Supervised fine-tuning (SFT)

Axolotl is a training framework that aims to make the process convenient yet flexible to users by simply passing a config yaml file.

As there are a lot of available options in Axolotl, this guide aims to provide an simplify the user experience to choosing the proper choice.

Axolotl supports 3 kinds of training methods: pre-training, supervised fine-tuning, and preference-based post-training (e.g. DPO, ORPO, PRMs). Each method has their own dataset format which are described below.

This guide will mainly use JSONL as an introduction. Please refer to the dataset loading docs to understand how to load datasets from other sources.

For pretraining_dataset: specifically, please refer to the Pre-training section.

When aiming to train on large corpora of text datasets, pre-training is your go-to choice. Due to the size of these datasets, downloading the entire-datasets before beginning training would be prohibitively time-consuming. Axolotl supports streaming to only load batches into memory at a time.

A sample format for a pre-training dataset is as follows:

It is typically recommended to save your dataset as .jsonl due to its flexibility and simplicity.

Axolotl supports loading from a Hugging Face hub repo or from local files.

As an example, to train using a Hugging Face dataset hf_org/name, you can pass the following config:

Given a few corpus files: A.jsonl, B.jsonl, and C.jsonl, your config will look like the below:

While we recommend .jsonl, you can also use the other formats (csv, parquet, arrow, SQL, Webdataset) that are supported by Dataset.load_dataset

In the case that the dataset is small and can be loaded entirely into memory, another approach to running pre-training is to use the completion format. This would mean that the entire dataset is pre-tokenized instead of on-demand in streaming.

One benefit of this is that the tokenization can be performed separately on a CPU-only machine, and then transferred to a GPU machine for training to save costs.

For completion only, Axolotl would split texts if it exceeds the context length into multiple smaller prompts. If you are interested in having this for pretraining_dataset too, please let us know or help make a PR!

When using streaming for large datasets, Axolotl does not know in advance how large the dataset is and does not know when to stop.

Therefore, it is necessary to set max_steps: int in your config for pre-training to run, so that Axolotl knows when to stop training.

One step is equal to sequence_len * micro_batch_size * gradient_accumulation_steps * total_num_gpus tokens.

It is recommended to leave this off if downloading from Hugging Face hub as it would download the entire dataset which can be very large.

Please see docs here.

Supervised fine-tuning is the process of training models to respond to an instruction or chat input.

As there are a wide variety of dataset formats, Axolotl tries to support a majority of the formats available in public datasets.

Axolotl provides four approaches for loading datasets, however, it’s easier to work backwards from the dataset you have available to figure out which approach to use.

A flow chart is as follows:

Do you already have the dataset tokenized? If yes, check Pre-Tokenized Dataset.

Do you want to format the dataset yourself and manually choose each section to mask? If yes, check Template Free Dataset

Is your dataset in a “conversation” format, containing a list[messages]? If yes, check Conversation Dataset

Is your dataset in an “instruct” format, containing { instruction, response }? If yes, check Instruction Dataset

If you went through the flow chart and did not find one that matches, it is recommended to preprocess your dataset into one of the above or create a thread on Github Discussion.

You can mix and match within each approach or across approaches to train a model on a variety of datasets.

We suggest this approach when you want to bring your own tokenized dataset.

Axolotl expects the dataset to have three keys:

Make sure to add BOS/EOS tokens to your prompt and mask it appropriately.

A config for this would look like:

Reference: Pre-Tokenized Dataset Documentation.

We recommend this approach when you want granular control over the prompt formatting, special tokens, and masking, whilst letting Axolotl handle the tokenization. This is very useful if your dataset has unique prompts that differ across samples and where one single general template wouldn’t suffice.

In the example below, you could see that there is no proper structure. At the same time, it’s very flexible as there are no constraints on how your prompt can look.

Each prompt must be have a key called segments which is a list of { text, label }.

Reference: Template Free Documentation.

conversation messages are a list of messages which usually contain a role and content key.

Fun fact: Axolotl synonymously refers to “chat” messages as conversation messages due to how FastChat initially used this term to build a widely used fastchat conversation method for formatting chat messages prior to the creation of chat_templates.

The current most popular and convenient method for inference is to use chat_templates for formatting prompts. Axolotl supports using chat_templates for training to ensure that the model performs in the same environment as in inference.

Here’s a quick rundown on chat_template: A chat_template is a Jinja2 template which formats a list of messages into a prompt.

An example of a prompt formatted into a popular template called ChatML can be seen below:

Single prompt (pretty-printed):

The ChatML template is as follows:

The above prompt formatted into this template will result in:

By using delimiters (<|im_start|> and <|im_end|>), a prompt separates different speakers which helps the model identify which portion belongs to whom.

Older conversation datasets with the following format are colloquially called sharegpt datasets.

Newer conversation datasets usually follow the OpenAI format.

Axolotl supports both as well as allowing customization of any kind of key.

To properly use this method, it is important to identify three things:

Which chat_template would you use?

What are the keys in your dataset, and what are the possible roles? For example, in OpenAI format, the keys would be messages, role, and content, respectively, whereas the possible roles are system, user, and assistant.

What do you want to mask? For instance, only assistant messages, only last message, or nothing.

There are a lot of chat_templates out there. Axolotl supports the common ones: supported chat templates. For example, to use ChatML, it would be chat_template: chatml.

However, it is also possible to use the already configured template within the tokenizer by specifying chat_template: tokenizer_default. If you want a fallback (in case some tokenizer does not have it pre-configured), you can do chat_template: tokenizer_default_fallback_chatml to fallback to the ChatML template if a tokenizer template was not found.

One last but powerful approach is to bring your own template. This can be set via:

We currently default to OpenAI format for dataset keys, so if that’s your current dataset format, there’s nothing to do here.

If your dataset format is different, here are the keys you should check (with their defaults):

In some chat_templates (e.g. Gemma), the roles are hardcoded to user and assistant. Consequently, you may find it necessary to map the roles in your dataset to these above. We currently have some defaults that should work for common datasets, but if you get a KeyError, it would be necessary to add mapping for your roles. Here is an example of how it would look like:

In the example above, all gpt and model values are converted to assistant. All human values are converted to user.

The common use case for chat_template is for chat messages, therefore, it is common to mask all non-assistant messages. Assistant messages refer to the bot messages that you want the model to learn on.

To train on all assistant messages, you would set the following configs.

The train_on_eos config means that it would mask all EOS tokens for turns that aren’t assistant-turns. The other options are: all and last to choose which EOS to train on.

Perhaps, you want to train on assistant and narrator roles, you can simply add narrator to the list of roles_to_train. You would also need to add it to the mapping of roles above.

As chat_templates may use hardcoded EOS/EOT tokens that are different from the tokenizer’s EOS, it is highly recommended to set them. For example, ChatML uses <|im_end|> to end turns.

Once all the above steps are completed, you could combine all these configs together to form a bespoke configuration for your custom dataset.

If this config were to be applied to the sample dataset above, the output would look as such (which can be retrieved via axolotl preprocess config.yaml --debug):

The first number refers to the label, the second refers to the token_id. For example, -100 labels appear on non-assistant portions, meaning that they are masked during. For assistant portions, the label is the same as the token_id.

If during preprocess, there are a lot of warnings of Could not find content __ boundary, please check the FAQ section for chat_templates.

Please see docs here.

Instruction datasets are used to train instruction-following models and comprise a prompt, containing an instruction, and a single response. In contrast to chat datasets which may be multi-turn, instruct datasets are typically single-turn.

An example is of a common format called Alpaca:

Using those keys, a prompt can be built based on it.

This can be configured as such:

Axolotl supports many kinds of instruction dataset. All of them can be found in the Instruction Dataset Documentation with their respective type and sample row format.

Due to the myriad possibilities of instruction formats, Axolotl allows customizing your own instruction format without having to dive into the code directly.

In the example below, a sample row is used to output in mistral_v1 format.

The config sets that the field_instruction is actually named input, and the field_input is empty as we don’t have an input in this sample. Generally, instruction can be thought as the question to the model, and input as the additional information with output being the response. It is not necessary to have an input nor system. In the end, the most important part is to understand what format you want it to look like and how you can customize this to your use case.

Reference: Custom Instruct Prompt Format Documentation.

As there are multiple RLHF methods with their own dataset requirements. Please see RLHF documentation for more detail.

**Examples:**

Example 1 (json):
```json
{"text": "first row"}
{"text": "second row"}
...
```

Example 2 (yaml):
```yaml
pretraining_dataset: hf_org/name
```

Example 3 (yaml):
```yaml
pretraining_dataset:
  - path: json
    data_files:
      - A.jsonl
      - B.jsonl
      - C.jsonl
```

Example 4 (yaml):
```yaml
datasets:
  - path: hf_org/name
    type: completion
```

---

## Dataset Formats

**URL:** https://docs.axolotl.ai/docs/dataset-formats

**Contents:**
- Dataset Formats
- Pre-training
  - Pre-training from Hugging Face hub datasets
  - Pre-training from local dataset files
  - Pre-training without streaming
  - Pre-training dataset configuration tips
    - Setting max_steps
    - Group_by_length
  - Reference
- Supervised fine-tuning (SFT)

Axolotl is a training framework that aims to make the process convenient yet flexible to users by simply passing a config yaml file.

As there are a lot of available options in Axolotl, this guide aims to provide an simplify the user experience to choosing the proper choice.

Axolotl supports 3 kinds of training methods: pre-training, supervised fine-tuning, and preference-based post-training (e.g. DPO, ORPO, PRMs). Each method has their own dataset format which are described below.

This guide will mainly use JSONL as an introduction. Please refer to the dataset loading docs to understand how to load datasets from other sources.

For pretraining_dataset: specifically, please refer to the Pre-training section.

When aiming to train on large corpora of text datasets, pre-training is your go-to choice. Due to the size of these datasets, downloading the entire-datasets before beginning training would be prohibitively time-consuming. Axolotl supports streaming to only load batches into memory at a time.

A sample format for a pre-training dataset is as follows:

It is typically recommended to save your dataset as .jsonl due to its flexibility and simplicity.

Axolotl supports loading from a Hugging Face hub repo or from local files.

As an example, to train using a Hugging Face dataset hf_org/name, you can pass the following config:

Given a few corpus files: A.jsonl, B.jsonl, and C.jsonl, your config will look like the below:

While we recommend .jsonl, you can also use the other formats (csv, parquet, arrow, SQL, Webdataset) that are supported by Dataset.load_dataset

In the case that the dataset is small and can be loaded entirely into memory, another approach to running pre-training is to use the completion format. This would mean that the entire dataset is pre-tokenized instead of on-demand in streaming.

One benefit of this is that the tokenization can be performed separately on a CPU-only machine, and then transferred to a GPU machine for training to save costs.

For completion only, Axolotl would split texts if it exceeds the context length into multiple smaller prompts. If you are interested in having this for pretraining_dataset too, please let us know or help make a PR!

When using streaming for large datasets, Axolotl does not know in advance how large the dataset is and does not know when to stop.

Therefore, it is necessary to set max_steps: int in your config for pre-training to run, so that Axolotl knows when to stop training.

One step is equal to sequence_len * micro_batch_size * gradient_accumulation_steps * total_num_gpus tokens.

It is recommended to leave this off if downloading from Hugging Face hub as it would download the entire dataset which can be very large.

Please see docs here.

Supervised fine-tuning is the process of training models to respond to an instruction or chat input.

As there are a wide variety of dataset formats, Axolotl tries to support a majority of the formats available in public datasets.

Axolotl provides four approaches for loading datasets, however, it’s easier to work backwards from the dataset you have available to figure out which approach to use.

A flow chart is as follows:

Do you already have the dataset tokenized? If yes, check Pre-Tokenized Dataset.

Do you want to format the dataset yourself and manually choose each section to mask? If yes, check Template Free Dataset

Is your dataset in a “conversation” format, containing a list[messages]? If yes, check Conversation Dataset

Is your dataset in an “instruct” format, containing { instruction, response }? If yes, check Instruction Dataset

If you went through the flow chart and did not find one that matches, it is recommended to preprocess your dataset into one of the above or create a thread on Github Discussion.

You can mix and match within each approach or across approaches to train a model on a variety of datasets.

We suggest this approach when you want to bring your own tokenized dataset.

Axolotl expects the dataset to have three keys:

Make sure to add BOS/EOS tokens to your prompt and mask it appropriately.

A config for this would look like:

Reference: Pre-Tokenized Dataset Documentation.

We recommend this approach when you want granular control over the prompt formatting, special tokens, and masking, whilst letting Axolotl handle the tokenization. This is very useful if your dataset has unique prompts that differ across samples and where one single general template wouldn’t suffice.

In the example below, you could see that there is no proper structure. At the same time, it’s very flexible as there are no constraints on how your prompt can look.

Each prompt must be have a key called segments which is a list of { text, label }.

Reference: Template Free Documentation.

conversation messages are a list of messages which usually contain a role and content key.

Fun fact: Axolotl synonymously refers to “chat” messages as conversation messages due to how FastChat initially used this term to build a widely used fastchat conversation method for formatting chat messages prior to the creation of chat_templates.

The current most popular and convenient method for inference is to use chat_templates for formatting prompts. Axolotl supports using chat_templates for training to ensure that the model performs in the same environment as in inference.

Here’s a quick rundown on chat_template: A chat_template is a Jinja2 template which formats a list of messages into a prompt.

An example of a prompt formatted into a popular template called ChatML can be seen below:

Single prompt (pretty-printed):

The ChatML template is as follows:

The above prompt formatted into this template will result in:

By using delimiters (<|im_start|> and <|im_end|>), a prompt separates different speakers which helps the model identify which portion belongs to whom.

Older conversation datasets with the following format are colloquially called sharegpt datasets.

Newer conversation datasets usually follow the OpenAI format.

Axolotl supports both as well as allowing customization of any kind of key.

To properly use this method, it is important to identify three things:

Which chat_template would you use?

What are the keys in your dataset, and what are the possible roles? For example, in OpenAI format, the keys would be messages, role, and content, respectively, whereas the possible roles are system, user, and assistant.

What do you want to mask? For instance, only assistant messages, only last message, or nothing.

There are a lot of chat_templates out there. Axolotl supports the common ones: supported chat templates. For example, to use ChatML, it would be chat_template: chatml.

However, it is also possible to use the already configured template within the tokenizer by specifying chat_template: tokenizer_default. If you want a fallback (in case some tokenizer does not have it pre-configured), you can do chat_template: tokenizer_default_fallback_chatml to fallback to the ChatML template if a tokenizer template was not found.

One last but powerful approach is to bring your own template. This can be set via:

We currently default to OpenAI format for dataset keys, so if that’s your current dataset format, there’s nothing to do here.

If your dataset format is different, here are the keys you should check (with their defaults):

In some chat_templates (e.g. Gemma), the roles are hardcoded to user and assistant. Consequently, you may find it necessary to map the roles in your dataset to these above. We currently have some defaults that should work for common datasets, but if you get a KeyError, it would be necessary to add mapping for your roles. Here is an example of how it would look like:

In the example above, all gpt and model values are converted to assistant. All human values are converted to user.

The common use case for chat_template is for chat messages, therefore, it is common to mask all non-assistant messages. Assistant messages refer to the bot messages that you want the model to learn on.

To train on all assistant messages, you would set the following configs.

The train_on_eos config means that it would mask all EOS tokens for turns that aren’t assistant-turns. The other options are: all and last to choose which EOS to train on.

Perhaps, you want to train on assistant and narrator roles, you can simply add narrator to the list of roles_to_train. You would also need to add it to the mapping of roles above.

As chat_templates may use hardcoded EOS/EOT tokens that are different from the tokenizer’s EOS, it is highly recommended to set them. For example, ChatML uses <|im_end|> to end turns.

Once all the above steps are completed, you could combine all these configs together to form a bespoke configuration for your custom dataset.

If this config were to be applied to the sample dataset above, the output would look as such (which can be retrieved via axolotl preprocess config.yaml --debug):

The first number refers to the label, the second refers to the token_id. For example, -100 labels appear on non-assistant portions, meaning that they are masked during. For assistant portions, the label is the same as the token_id.

If during preprocess, there are a lot of warnings of Could not find content __ boundary, please check the FAQ section for chat_templates.

Please see docs here.

Instruction datasets are used to train instruction-following models and comprise a prompt, containing an instruction, and a single response. In contrast to chat datasets which may be multi-turn, instruct datasets are typically single-turn.

An example is of a common format called Alpaca:

Using those keys, a prompt can be built based on it.

This can be configured as such:

Axolotl supports many kinds of instruction dataset. All of them can be found in the Instruction Dataset Documentation with their respective type and sample row format.

Due to the myriad possibilities of instruction formats, Axolotl allows customizing your own instruction format without having to dive into the code directly.

In the example below, a sample row is used to output in mistral_v1 format.

The config sets that the field_instruction is actually named input, and the field_input is empty as we don’t have an input in this sample. Generally, instruction can be thought as the question to the model, and input as the additional information with output being the response. It is not necessary to have an input nor system. In the end, the most important part is to understand what format you want it to look like and how you can customize this to your use case.

Reference: Custom Instruct Prompt Format Documentation.

As there are multiple RLHF methods with their own dataset requirements. Please see RLHF documentation for more detail.

**Examples:**

Example 1 (json):
```json
{"text": "first row"}
{"text": "second row"}
...
```

Example 2 (yaml):
```yaml
pretraining_dataset: hf_org/name
```

Example 3 (yaml):
```yaml
pretraining_dataset:
  - path: json
    data_files:
      - A.jsonl
      - B.jsonl
      - C.jsonl
```

Example 4 (yaml):
```yaml
datasets:
  - path: hf_org/name
    type: completion
```

---

## Instruction Tuning

**URL:** https://docs.axolotl.ai/docs/dataset-formats/inst_tune.html

**Contents:**
- Instruction Tuning
- alpaca
- jeopardy
- oasst
- gpteacher
- reflection
- explainchoice
- concisechoice
- summarizetldr
- alpaca_chat

instruction; input(optional)

instruction; input(optional)

instruction with reflect; input(optional)

question, choices, (solution OR explanation)

question, choices, (solution OR explanation)

basic instruct for alpaca chat

question and answer for alpaca chat

question and answer for alpaca chat, for concise answers

question and answer for alpaca chat, for load_camel_ai

support for open orca datasets with included system prompts, instruct

in context question answering from an article

in context question answering (alternate)

in context question answering from an article, with default response for no answer from context

instruction and revision

instruction, adds additional eos tokens

For a dataset that is preprocessed for instruction purposes:

You can use this example in your YAML config:

See full config options under here.

**Examples:**

Example 1 (json):
```json
{"instruction": "...", "input": "...", "output": "..."}
```

Example 2 (json):
```json
{"question": "...", "category": "...", "answer": "..."}
```

Example 3 (json):
```json
{"INSTRUCTION": "...", "RESPONSE": "..."}
```

Example 4 (json):
```json
{"instruction": "...", "input": "...", "response": "..."}
```

---

## Stepwise Supervised Format

**URL:** https://docs.axolotl.ai/docs/dataset-formats/stepwise_supervised.html

**Contents:**
- Stepwise Supervised Format
- Stepwise Supervised
  - Example

The stepwise supervised format is designed for chain-of-thought (COT) reasoning datasets where each example contains multiple completion steps and a preference label for each step.

Here’s a simple example of a stepwise supervised dataset entry:

**Examples:**

Example 1 (json):
```json
{
  "prompt": "Which number is larger, 9.8 or 9.11?",
  "completions": [
    "The fractional part of 9.8 is 0.8, while the fractional part of 9.11 is 0.11.",
    "Since 0.11 is greater than 0.8, the number 9.11 is larger than 9.8."
  ],
  "labels": [true, false]
}
```

---
