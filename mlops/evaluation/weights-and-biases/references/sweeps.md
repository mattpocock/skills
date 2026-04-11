# Comprehensive Hyperparameter Sweeps Guide

Complete guide to hyperparameter optimization with W&B Sweeps.

## Table of Contents
- Sweep Configuration
- Search Strategies
- Parameter Distributions
- Early Termination
- Parallel Execution
- Advanced Patterns
- Real-World Examples

## Sweep Configuration

### Basic Sweep Config

```python
sweep_config = {
    'method': 'bayes',  # Search strategy
    'metric': {
        'name': 'val/accuracy',
        'goal': 'maximize'  # or 'minimize'
    },
    'parameters': {
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },
        'batch_size': {
            'values': [16, 32, 64, 128]
        }
    }
}

# Initialize sweep
sweep_id = wandb.sweep(sweep_config, project="my-project")
```

### Complete Config Example

```python
sweep_config = {
    # Required: Search method
    'method': 'bayes',

    # Required: Optimization metric
    'metric': {
        'name': 'val/f1_score',
        'goal': 'maximize'
    },

    # Required: Parameters to search
    'parameters': {
        # Continuous parameter
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },

        # Discrete values
        'batch_size': {
            'values': [16, 32, 64, 128]
        },

        # Categorical
        'optimizer': {
            'values': ['adam', 'sgd', 'rmsprop', 'adamw']
        },

        # Uniform distribution
        'dropout': {
            'distribution': 'uniform',
            'min': 0.1,
            'max': 0.5
        },

        # Integer range
        'num_layers': {
            'distribution': 'int_uniform',
            'min': 2,
            'max': 10
        },

        # Fixed value (constant across runs)
        'epochs': {
            'value': 50
        }
    },

    # Optional: Early termination
    'early_terminate': {
        'type': 'hyperband',
        'min_iter': 5,
        's': 2,
        'eta': 3,
        'max_iter': 27
    }
}
```

## Search Strategies

### 1. Grid Search

Exhaustively search all combinations.

```python
sweep_config = {
    'method': 'grid',
    'parameters': {
        'learning_rate': {
            'values': [0.001, 0.01, 0.1]
        },
        'batch_size': {
            'values': [16, 32, 64]
        },
        'optimizer': {
            'values': ['adam', 'sgd']
        }
    }
}

# Total runs: 3 × 3 × 2 = 18 runs
```

**Pros:**
- Comprehensive search
- Reproducible results
- No randomness

**Cons:**
- Exponential growth with parameters
- Inefficient for continuous parameters
- Not scalable beyond 3-4 parameters

**When to use:**
- Few parameters (< 4)
- All discrete values
- Need complete coverage

### 2. Random Search

Randomly sample parameter combinations.

```python
sweep_config = {
    'method': 'random',
    'parameters': {
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },
        'batch_size': {
            'values': [16, 32, 64, 128, 256]
        },
        'dropout': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 0.5
        },
        'num_layers': {
            'distribution': 'int_uniform',
            'min': 2,
            'max': 8
        }
    }
}

# Run 100 random trials
wandb.agent(sweep_id, function=train, count=100)
```

**Pros:**
- Scales to many parameters
- Can run indefinitely
- Often finds good solutions quickly

**Cons:**
- No learning from previous runs
- May miss optimal region
- Results vary with random seed

**When to use:**
- Many parameters (> 4)
- Quick exploration
- Limited budget

### 3. Bayesian Optimization (Recommended)

Learn from previous trials to sample promising regions.

```python
sweep_config = {
    'method': 'bayes',
    'metric': {
        'name': 'val/loss',
        'goal': 'minimize'
    },
    'parameters': {
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },
        'weight_decay': {
            'distribution': 'log_uniform',
            'min': 1e-6,
            'max': 1e-2
        },
        'dropout': {
            'distribution': 'uniform',
            'min': 0.1,
            'max': 0.5
        },
        'num_layers': {
            'values': [2, 3, 4, 5, 6]
        }
    }
}
```

**Pros:**
- Most sample-efficient
- Learns from past trials
- Focuses on promising regions

**Cons:**
- Initial random exploration phase
- May get stuck in local optima
- Slower per iteration

**When to use:**
- Expensive training runs
- Need best performance
- Limited compute budget

## Parameter Distributions

### Continuous Distributions

```python
# Log-uniform: Good for learning rates, regularization
'learning_rate': {
    'distribution': 'log_uniform',
    'min': 1e-6,
    'max': 1e-1
}

# Uniform: Good for dropout, momentum
'dropout': {
    'distribution': 'uniform',
    'min': 0.0,
    'max': 0.5
}

# Normal distribution
'parameter': {
    'distribution': 'normal',
    'mu': 0.5,
    'sigma': 0.1
}

# Log-normal distribution
'parameter': {
    'distribution': 'log_normal',
    'mu': 0.0,
    'sigma': 1.0
}
```

### Discrete Distributions

```python
# Fixed values
'batch_size': {
    'values': [16, 32, 64, 128, 256]
}

# Integer uniform
'num_layers': {
    'distribution': 'int_uniform',
    'min': 2,
    'max': 10
}

# Quantized uniform (step size)
'layer_size': {
    'distribution': 'q_uniform',
    'min': 32,
    'max': 512,
    'q': 32  # Step by 32: 32, 64, 96, 128...
}

# Quantized log-uniform
'hidden_size': {
    'distribution': 'q_log_uniform',
    'min': 32,
    'max': 1024,
    'q': 32
}
```

### Categorical Parameters

```python
# Optimizers
'optimizer': {
    'values': ['adam', 'sgd', 'rmsprop', 'adamw']
}

# Model architectures
'model': {
    'values': ['resnet18', 'resnet34', 'resnet50', 'efficientnet_b0']
}

# Activation functions
'activation': {
    'values': ['relu', 'gelu', 'silu', 'leaky_relu']
}
```

## Early Termination

Stop underperforming runs early to save compute.

### Hyperband

```python
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'val/accuracy', 'goal': 'maximize'},
    'parameters': {...},

    # Hyperband early termination
    'early_terminate': {
        'type': 'hyperband',
        'min_iter': 3,      # Minimum iterations before termination
        's': 2,             # Bracket count
        'eta': 3,           # Downsampling rate
        'max_iter': 27      # Maximum iterations
    }
}
```

**How it works:**
- Runs trials in brackets
- Keeps top 1/eta performers each round
- Eliminates bottom performers early

### Custom Termination

```python
def train():
    run = wandb.init()

    for epoch in range(MAX_EPOCHS):
        loss = train_epoch()
        val_acc = validate()

        wandb.log({'val/accuracy': val_acc, 'epoch': epoch})

        # Custom early stopping
        if epoch > 5 and val_acc < 0.5:
            print("Early stop: Poor performance")
            break

        if epoch > 10 and val_acc > best_acc - 0.01:
            print("Early stop: No improvement")
            break
```

## Training Function

### Basic Template

```python
def train():
    # Initialize W&B run
    run = wandb.init()

    # Get hyperparameters
    config = wandb.config

    # Build model with config
    model = build_model(
        hidden_size=config.hidden_size,
        num_layers=config.num_layers,
        dropout=config.dropout
    )

    # Create optimizer
    optimizer = create_optimizer(
        model.parameters(),
        name=config.optimizer,
        lr=config.learning_rate,
        weight_decay=config.weight_decay
    )

    # Training loop
    for epoch in range(config.epochs):
        # Train
        train_loss, train_acc = train_epoch(
            model, optimizer, train_loader, config.batch_size
        )

        # Validate
        val_loss, val_acc = validate(model, val_loader)

        # Log metrics
        wandb.log({
            'train/loss': train_loss,
            'train/accuracy': train_acc,
            'val/loss': val_loss,
            'val/accuracy': val_acc,
            'epoch': epoch
        })

    # Log final model
    torch.save(model.state_dict(), 'model.pth')
    wandb.save('model.pth')

    # Finish run
    wandb.finish()
```

### With PyTorch

```python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
import wandb

def train():
    run = wandb.init()
    config = wandb.config

    # Data
    train_loader = DataLoader(
        train_dataset,
        batch_size=config.batch_size,
        shuffle=True
    )

    # Model
    model = ResNet(
        num_classes=config.num_classes,
        dropout=config.dropout
    ).to(device)

    # Optimizer
    if config.optimizer == 'adam':
        optimizer = torch.optim.Adam(
            model.parameters(),
            lr=config.learning_rate,
            weight_decay=config.weight_decay
        )
    elif config.optimizer == 'sgd':
        optimizer = torch.optim.SGD(
            model.parameters(),
            lr=config.learning_rate,
            momentum=config.momentum,
            weight_decay=config.weight_decay
        )

    # Scheduler
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=config.epochs
    )

    # Training
    for epoch in range(config.epochs):
        model.train()
        train_loss = 0.0

        for data, target in train_loader:
            data, target = data.to(device), target.to(device)

            optimizer.zero_grad()
            output = model(data)
            loss = nn.CrossEntropyLoss()(output, target)
            loss.backward()
            optimizer.step()

            train_loss += loss.item()

        # Validation
        model.eval()
        val_loss, val_acc = validate(model, val_loader)

        # Step scheduler
        scheduler.step()

        # Log
        wandb.log({
            'train/loss': train_loss / len(train_loader),
            'val/loss': val_loss,
            'val/accuracy': val_acc,
            'learning_rate': scheduler.get_last_lr()[0],
            'epoch': epoch
        })
```

## Parallel Execution

### Multiple Agents

Run sweep agents in parallel to speed up search.

```python
# Initialize sweep once
sweep_id = wandb.sweep(sweep_config, project="my-project")

# Run multiple agents in parallel
# Agent 1 (Terminal 1)
wandb.agent(sweep_id, function=train, count=20)

# Agent 2 (Terminal 2)
wandb.agent(sweep_id, function=train, count=20)

# Agent 3 (Terminal 3)
wandb.agent(sweep_id, function=train, count=20)

# Total: 60 runs across 3 agents
```

### Multi-GPU Execution

```python
import os

def train():
    # Get available GPU
    gpu_id = os.environ.get('CUDA_VISIBLE_DEVICES', '0')

    run = wandb.init()
    config = wandb.config

    # Train on specific GPU
    device = torch.device(f'cuda:{gpu_id}')
    model = model.to(device)

    # ... rest of training ...

# Run agents on different GPUs
# Terminal 1
# CUDA_VISIBLE_DEVICES=0 wandb agent sweep_id

# Terminal 2
# CUDA_VISIBLE_DEVICES=1 wandb agent sweep_id

# Terminal 3
# CUDA_VISIBLE_DEVICES=2 wandb agent sweep_id
```

## Advanced Patterns

### Nested Parameters

```python
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'val/accuracy', 'goal': 'maximize'},
    'parameters': {
        'model': {
            'parameters': {
                'type': {
                    'values': ['resnet', 'efficientnet']
                },
                'size': {
                    'values': ['small', 'medium', 'large']
                }
            }
        },
        'optimizer': {
            'parameters': {
                'type': {
                    'values': ['adam', 'sgd']
                },
                'lr': {
                    'distribution': 'log_uniform',
                    'min': 1e-5,
                    'max': 1e-1
                }
            }
        }
    }
}

# Access nested config
def train():
    run = wandb.init()
    model_type = wandb.config.model.type
    model_size = wandb.config.model.size
    opt_type = wandb.config.optimizer.type
    lr = wandb.config.optimizer.lr
```

### Conditional Parameters

```python
sweep_config = {
    'method': 'bayes',
    'parameters': {
        'optimizer': {
            'values': ['adam', 'sgd']
        },
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-1
        },
        # Only used if optimizer == 'sgd'
        'momentum': {
            'distribution': 'uniform',
            'min': 0.5,
            'max': 0.99
        }
    }
}

def train():
    run = wandb.init()
    config = wandb.config

    if config.optimizer == 'adam':
        optimizer = torch.optim.Adam(
            model.parameters(),
            lr=config.learning_rate
        )
    elif config.optimizer == 'sgd':
        optimizer = torch.optim.SGD(
            model.parameters(),
            lr=config.learning_rate,
            momentum=config.momentum  # Conditional parameter
        )
```

## Real-World Examples

### Image Classification

```python
sweep_config = {
    'method': 'bayes',
    'metric': {
        'name': 'val/top1_accuracy',
        'goal': 'maximize'
    },
    'parameters': {
        # Model
        'architecture': {
            'values': ['resnet50', 'resnet101', 'efficientnet_b0', 'efficientnet_b3']
        },
        'pretrained': {
            'values': [True, False]
        },

        # Training
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-5,
            'max': 1e-2
        },
        'batch_size': {
            'values': [16, 32, 64, 128]
        },
        'optimizer': {
            'values': ['adam', 'sgd', 'adamw']
        },
        'weight_decay': {
            'distribution': 'log_uniform',
            'min': 1e-6,
            'max': 1e-2
        },

        # Regularization
        'dropout': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 0.5
        },
        'label_smoothing': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 0.2
        },

        # Data augmentation
        'mixup_alpha': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 1.0
        },
        'cutmix_alpha': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 1.0
        }
    },
    'early_terminate': {
        'type': 'hyperband',
        'min_iter': 5
    }
}
```

### NLP Fine-Tuning

```python
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'eval/f1', 'goal': 'maximize'},
    'parameters': {
        # Model
        'model_name': {
            'values': ['bert-base-uncased', 'roberta-base', 'distilbert-base-uncased']
        },

        # Training
        'learning_rate': {
            'distribution': 'log_uniform',
            'min': 1e-6,
            'max': 1e-4
        },
        'per_device_train_batch_size': {
            'values': [8, 16, 32]
        },
        'num_train_epochs': {
            'values': [3, 4, 5]
        },
        'warmup_ratio': {
            'distribution': 'uniform',
            'min': 0.0,
            'max': 0.1
        },
        'weight_decay': {
            'distribution': 'log_uniform',
            'min': 1e-4,
            'max': 1e-1
        },

        # Optimizer
        'adam_beta1': {
            'distribution': 'uniform',
            'min': 0.8,
            'max': 0.95
        },
        'adam_beta2': {
            'distribution': 'uniform',
            'min': 0.95,
            'max': 0.999
        }
    }
}
```

## Best Practices

### 1. Start Small

```python
# Initial exploration: Random search, 20 runs
sweep_config_v1 = {
    'method': 'random',
    'parameters': {...}
}
wandb.agent(sweep_id_v1, train, count=20)

# Refined search: Bayes, narrow ranges
sweep_config_v2 = {
    'method': 'bayes',
    'parameters': {
        'learning_rate': {
            'min': 5e-5,  # Narrowed from 1e-6 to 1e-4
            'max': 1e-4
        }
    }
}
```

### 2. Use Log Scales

```python
# ✅ Good: Log scale for learning rate
'learning_rate': {
    'distribution': 'log_uniform',
    'min': 1e-6,
    'max': 1e-2
}

# ❌ Bad: Linear scale
'learning_rate': {
    'distribution': 'uniform',
    'min': 0.000001,
    'max': 0.01
}
```

### 3. Set Reasonable Ranges

```python
# Base ranges on prior knowledge
'learning_rate': {'min': 1e-5, 'max': 1e-3},  # Typical for Adam
'batch_size': {'values': [16, 32, 64]},       # GPU memory limits
'dropout': {'min': 0.1, 'max': 0.5}           # Too high hurts training
```

### 4. Monitor Resource Usage

```python
def train():
    run = wandb.init()

    # Log system metrics
    wandb.log({
        'system/gpu_memory_allocated': torch.cuda.memory_allocated(),
        'system/gpu_memory_reserved': torch.cuda.memory_reserved()
    })
```

### 5. Save Best Models

```python
def train():
    run = wandb.init()
    best_acc = 0.0

    for epoch in range(config.epochs):
        val_acc = validate(model)

        if val_acc > best_acc:
            best_acc = val_acc
            # Save best checkpoint
            torch.save(model.state_dict(), 'best_model.pth')
            wandb.save('best_model.pth')
```

## Resources

- **Sweeps Documentation**: https://docs.wandb.ai/guides/sweeps
- **Configuration Reference**: https://docs.wandb.ai/guides/sweeps/configuration
- **Examples**: https://github.com/wandb/examples/tree/master/examples/wandb-sweeps
