---
name: weights-and-biases
description: Track ML experiments with automatic logging, visualize training in real-time, optimize hyperparameters with sweeps, and manage model registry with W&B - collaborative MLOps platform
version: 1.0.0
author: Orchestra Research
license: MIT
dependencies: [wandb]
metadata:
  hermes:
    tags: [MLOps, Weights And Biases, WandB, Experiment Tracking, Hyperparameter Tuning, Model Registry, Collaboration, Real-Time Visualization, PyTorch, TensorFlow, HuggingFace]

---

# Weights & Biases: ML Experiment Tracking & MLOps

## When to Use This Skill

Use Weights & Biases (W&B) when you need to:
- **Track ML experiments** with automatic metric logging
- **Visualize training** in real-time dashboards
- **Compare runs** across hyperparameters and configurations
- **Optimize hyperparameters** with automated sweeps
- **Manage model registry** with versioning and lineage
- **Collaborate on ML projects** with team workspaces
- **Track artifacts** (datasets, models, code) with lineage

**Users**: 200,000+ ML practitioners | **GitHub Stars**: 10.5k+ | **Integrations**: 100+

## Installation

```bash
# Install W&B
pip install wandb

# Login (creates API key)
wandb login

# Or set API key programmatically
export WANDB_API_KEY=your_api_key_here
```

## Quick Start

### Basic Experiment Tracking

```python
import wandb

# Initialize a run
run = wandb.init(
    project="my-project",
    config={
        "learning_rate": 0.001,
        "epochs": 10,
        "batch_size": 32,
        "architecture": "ResNet50"
    }
)

# Training loop
for epoch in range(run.config.epochs):
    # Your training code
    train_loss = train_epoch()
    val_loss = validate()

    # Log metrics
    wandb.log({
        "epoch": epoch,
        "train/loss": train_loss,
        "val/loss": val_loss,
        "train/accuracy": train_acc,
        "val/accuracy": val_acc
    })

# Finish the run
wandb.finish()
```

### With PyTorch

```python
import torch
import wandb

# Initialize
wandb.init(project="pytorch-demo", config={
    "lr": 0.001,
    "epochs": 10
})

# Access config
config = wandb.config

# Training loop
for epoch in range(config.epochs):
    for batch_idx, (data, target) in enumerate(train_loader):
        # Forward pass
        output = model(data)
        loss = criterion(output, target)

        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        # Log every 100 batches
        if batch_idx % 100 == 0:
            wandb.log({
                "loss": loss.item(),
                "epoch": epoch,
                "batch": batch_idx
            })

# Save model
torch.save(model.state_dict(), "model.pth")
wandb.save("model.pth")  # Upload to W&B

wandb.finish()
```

## Core Concepts

### 1. Projects and Runs

**Project**: Collection of related experiments
**Run**: Single execution of your training script

```python
# Create/use project
run = wandb.init(
    project="image-classification",
    name="resnet50-experiment-1",  # Optional run name
    tags=["baseline", "resnet"],    # Organize with tags
    notes="First baseline run"      # Add notes
)

# Each run has unique ID
print(f"Run ID: {run.id}")
print(f"Run URL: {run.url}")
```

### 2. Configuration Tracking

Track hyperparameters automatically:

```python
config = {
    # Model architecture
    "model": "ResNet50",
    "pretrained": True,

    # Training params
    "learning_rate": 0.001,
    "batch_size": 32,
    "epochs": 50,
    "optimizer": "Adam",

    # Data params
    "dataset": "ImageNet",
    "augmentation": "standard"
}

wandb.init(project="my-project", config=config)

# Access config during training
lr = wandb.config.learning_rate
batch_size = wandb.config.batch_size
```

### 3. Metric Logging

```python
# Log scalars
wandb.log({"loss": 0.5, "accuracy": 0.92})

# Log multiple metrics
wandb.log({
    "train/loss": train_loss,
    "train/accuracy": train_acc,
    "val/loss": val_loss,
    "val/accuracy": val_acc,
    "learning_rate": current_lr,
    "epoch": epoch
})

# Log with custom x-axis
wandb.log({"loss": loss}, step=global_step)

# Log media (images, audio, video)
wandb.log({"examples": [wandb.Image(img) for img in images]})

# Log histograms
wandb.log({"gradients": wandb.Histogram(gradients)})

# Log tables
table = wandb.Table(columns=["id", "prediction", "ground_truth"])
wandb.log({"predictions": table})
```

### 4. Model Checkpointing

```python
import torch
import wandb

# Save model checkpoint
checkpoint = {
    'epoch': epoch,
    'model_state_dict': model.state_dict(),
    'optimizer_state_dict': optimizer.state_dict(),
    'loss': loss,
}

torch.save(checkpoint, 'checkpoint.pth')

# Upload to W&B
wandb.save('checkpoint.pth')

# Or use Artifacts (recommended)
artifact = wandb.Artifact('model', type='model')
artifact.add_file('checkpoint.pth')
wandb.log_artifact(artifact)
```

## Hyperparameter Sweeps

Automatically search for optimal hyperparameters.

### Define Sweep Configuration

```python
sweep_config = {
    'method': 'bayes',  # or 'grid', 'random'
    'metric': {
        'name': 'val/accuracy',
        'goal': 'maximize'
    },
    'parameters': {
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },
        'batch_size': {
            'values': [16, 32, 64, 128]
        },
        'optimizer': {
            'values': ['adam', 'sgd', 'rmsprop']
        },
        'dropout': {
            'distribution': 'uniform',
            'min': 0.1,
            'max': 0.5
        }
    }
}

# Initialize sweep
sweep_id = wandb.sweep(sweep_config, project="my-project")
```

### Define Training Function

```python
def train():
    # Initialize run
    run = wandb.init()

    # Access sweep parameters
    lr = wandb.config.learning_rate
    batch_size = wandb.config.batch_size
    optimizer_name = wandb.config.optimizer

    # Build model with sweep config
    model = build_model(wandb.config)
    optimizer = get_optimizer(optimizer_name, lr)

    # Training loop
    for epoch in range(NUM_EPOCHS):
        train_loss = train_epoch(model, optimizer, batch_size)
        val_acc = validate(model)

        # Log metrics
        wandb.log({
            "train/loss": train_loss,
            "val/accuracy": val_acc
        })

# Run sweep
wandb.agent(sweep_id, function=train, count=50)  # Run 50 trials
```

### Sweep Strategies

```python
# Grid search - exhaustive
sweep_config = {
    'method': 'grid',
    'parameters': {
        'lr': {'values': [0.001, 0.01, 0.1]},
        'batch_size': {'values': [16, 32, 64]}
    }
}

# Random search
sweep_config = {
    'method': 'random',
    'parameters': {
        'lr': {'distribution': 'uniform', 'min': 0.0001, 'max': 0.1},
        'dropout': {'distribution': 'uniform', 'min': 0.1, 'max': 0.5}
    }
}

# Bayesian optimization (recommended)
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'val/loss', 'goal': 'minimize'},
    'parameters': {
        'lr': {'distribution': 'log_uniform', 'min': 1e-5, 'max': 1e-1}
    }
}
```

## Artifacts

Track datasets, models, and other files with lineage.

### Log Artifacts

```python
# Create artifact
artifact = wandb.Artifact(
    name='training-dataset',
    type='dataset',
    description='ImageNet training split',
    metadata={'size': '1.2M images', 'split': 'train'}
)

# Add files
artifact.add_file('data/train.csv')
artifact.add_dir('data/images/')

# Log artifact
wandb.log_artifact(artifact)
```

### Use Artifacts

```python
# Download and use artifact
run = wandb.init(project="my-project")

# Download artifact
artifact = run.use_artifact('training-dataset:latest')
artifact_dir = artifact.download()

# Use the data
data = load_data(f"{artifact_dir}/train.csv")
```

### Model Registry

```python
# Log model as artifact
model_artifact = wandb.Artifact(
    name='resnet50-model',
    type='model',
    metadata={'architecture': 'ResNet50', 'accuracy': 0.95}
)

model_artifact.add_file('model.pth')
wandb.log_artifact(model_artifact, aliases=['best', 'production'])

# Link to model registry
run.link_artifact(model_artifact, 'model-registry/production-models')
```

## Integration Examples

### HuggingFace Transformers

```python
from transformers import Trainer, TrainingArguments
import wandb

# Initialize W&B
wandb.init(project="hf-transformers")

# Training arguments with W&B
training_args = TrainingArguments(
    output_dir="./results",
    report_to="wandb",  # Enable W&B logging
    run_name="bert-finetuning",
    logging_steps=100,
    save_steps=500
)

# Trainer automatically logs to W&B
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset
)

trainer.train()
```

### PyTorch Lightning

```python
from pytorch_lightning import Trainer
from pytorch_lightning.loggers import WandbLogger
import wandb

# Create W&B logger
wandb_logger = WandbLogger(
    project="lightning-demo",
    log_model=True  # Log model checkpoints
)

# Use with Trainer
trainer = Trainer(
    logger=wandb_logger,
    max_epochs=10
)

trainer.fit(model, datamodule=dm)
```

### Keras/TensorFlow

```python
import wandb
from wandb.keras import WandbCallback

# Initialize
wandb.init(project="keras-demo")

# Add callback
model.fit(
    x_train, y_train,
    validation_data=(x_val, y_val),
    epochs=10,
    callbacks=[WandbCallback()]  # Auto-logs metrics
)
```

## Visualization & Analysis

### Custom Charts

```python
# Log custom visualizations
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot(x, y)
wandb.log({"custom_plot": wandb.Image(fig)})

# Log confusion matrix
wandb.log({"conf_mat": wandb.plot.confusion_matrix(
    probs=None,
    y_true=ground_truth,
    preds=predictions,
    class_names=class_names
)})
```

### Reports

Create shareable reports in W&B UI:
- Combine runs, charts, and text
- Markdown support
- Embeddable visualizations
- Team collaboration

## Best Practices

### 1. Organize with Tags and Groups

```python
wandb.init(
    project="my-project",
    tags=["baseline", "resnet50", "imagenet"],
    group="resnet-experiments",  # Group related runs
    job_type="train"             # Type of job
)
```

### 2. Log Everything Relevant

```python
# Log system metrics
wandb.log({
    "gpu/util": gpu_utilization,
    "gpu/memory": gpu_memory_used,
    "cpu/util": cpu_utilization
})

# Log code version
wandb.log({"git_commit": git_commit_hash})

# Log data splits
wandb.log({
    "data/train_size": len(train_dataset),
    "data/val_size": len(val_dataset)
})
```

### 3. Use Descriptive Names

```python
# ✅ Good: Descriptive run names
wandb.init(
    project="nlp-classification",
    name="bert-base-lr0.001-bs32-epoch10"
)

# ❌ Bad: Generic names
wandb.init(project="nlp", name="run1")
```

### 4. Save Important Artifacts

```python
# Save final model
artifact = wandb.Artifact('final-model', type='model')
artifact.add_file('model.pth')
wandb.log_artifact(artifact)

# Save predictions for analysis
predictions_table = wandb.Table(
    columns=["id", "input", "prediction", "ground_truth"],
    data=predictions_data
)
wandb.log({"predictions": predictions_table})
```

### 5. Use Offline Mode for Unstable Connections

```python
import os

# Enable offline mode
os.environ["WANDB_MODE"] = "offline"

wandb.init(project="my-project")
# ... your code ...

# Sync later
# wandb sync <run_directory>
```

## Team Collaboration

### Share Runs

```python
# Runs are automatically shareable via URL
run = wandb.init(project="team-project")
print(f"Share this URL: {run.url}")
```

### Team Projects

- Create team account at wandb.ai
- Add team members
- Set project visibility (private/public)
- Use team-level artifacts and model registry

## Pricing

- **Free**: Unlimited public projects, 100GB storage
- **Academic**: Free for students/researchers
- **Teams**: $50/seat/month, private projects, unlimited storage
- **Enterprise**: Custom pricing, on-prem options

## Resources

- **Documentation**: https://docs.wandb.ai
- **GitHub**: https://github.com/wandb/wandb (10.5k+ stars)
- **Examples**: https://github.com/wandb/examples
- **Community**: https://wandb.ai/community
- **Discord**: https://wandb.me/discord

## See Also

- `references/sweeps.md` - Comprehensive hyperparameter optimization guide
- `references/artifacts.md` - Data and model versioning patterns
- `references/integrations.md` - Framework-specific examples


