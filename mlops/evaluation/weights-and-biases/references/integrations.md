# Framework Integrations Guide

Complete guide to integrating W&B with popular ML frameworks.

## Table of Contents
- HuggingFace Transformers
- PyTorch Lightning
- Keras/TensorFlow
- Fast.ai
- XGBoost/LightGBM
- PyTorch Native
- Custom Integrations

## HuggingFace Transformers

### Automatic Integration

```python
from transformers import Trainer, TrainingArguments
import wandb

# Initialize W&B
wandb.init(project="hf-transformers", name="bert-finetuning")

# Training arguments with W&B
training_args = TrainingArguments(
    output_dir="./results",
    report_to="wandb",  # Enable W&B logging
    run_name="bert-base-finetuning",

    # Training params
    num_train_epochs=3,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=64,
    learning_rate=2e-5,

    # Logging
    logging_dir="./logs",
    logging_steps=100,
    logging_first_step=True,

    # Evaluation
    evaluation_strategy="steps",
    eval_steps=500,
    save_steps=500,

    # Other
    load_best_model_at_end=True,
    metric_for_best_model="eval_accuracy"
)

# Trainer automatically logs to W&B
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    compute_metrics=compute_metrics
)

# Train (metrics logged automatically)
trainer.train()

# Finish W&B run
wandb.finish()
```

### Custom Logging

```python
from transformers import Trainer, TrainingArguments
from transformers.integrations import WandbCallback
import wandb

class CustomWandbCallback(WandbCallback):
    def on_evaluate(self, args, state, control, metrics=None, **kwargs):
        super().on_evaluate(args, state, control, metrics, **kwargs)

        # Log custom metrics
        wandb.log({
            "custom/eval_score": metrics["eval_accuracy"] * 100,
            "custom/epoch": state.epoch
        })

# Use custom callback
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
    callbacks=[CustomWandbCallback()]
)
```

### Log Model to Registry

```python
from transformers import Trainer, TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    report_to="wandb",
    load_best_model_at_end=True
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset
)

trainer.train()

# Save final model as artifact
model_artifact = wandb.Artifact(
    'hf-bert-model',
    type='model',
    description='BERT finetuned on sentiment analysis'
)

# Save model files
trainer.save_model("./final_model")
model_artifact.add_dir("./final_model")

# Log artifact
wandb.log_artifact(model_artifact, aliases=['best', 'production'])
wandb.finish()
```

## PyTorch Lightning

### Basic Integration

```python
import pytorch_lightning as pl
from pytorch_lightning.loggers import WandbLogger
import wandb

# Create W&B logger
wandb_logger = WandbLogger(
    project="lightning-demo",
    name="resnet50-training",
    log_model=True,  # Log model checkpoints as artifacts
    save_code=True   # Save code as artifact
)

# Lightning module
class LitModel(pl.LightningModule):
    def __init__(self, learning_rate=0.001):
        super().__init__()
        self.save_hyperparameters()
        self.model = create_model()

    def training_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)
        loss = F.cross_entropy(y_hat, y)

        # Log metrics (automatically sent to W&B)
        self.log('train/loss', loss, on_step=True, on_epoch=True)
        self.log('train/accuracy', accuracy(y_hat, y), on_epoch=True)

        return loss

    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)
        loss = F.cross_entropy(y_hat, y)

        self.log('val/loss', loss, on_step=False, on_epoch=True)
        self.log('val/accuracy', accuracy(y_hat, y), on_epoch=True)

        return loss

    def configure_optimizers(self):
        return torch.optim.Adam(self.parameters(), lr=self.hparams.learning_rate)

# Trainer with W&B logger
trainer = pl.Trainer(
    logger=wandb_logger,
    max_epochs=10,
    accelerator="gpu",
    devices=1
)

# Train (metrics logged automatically)
trainer.fit(model, datamodule=dm)

# Finish W&B run
wandb.finish()
```

### Log Media

```python
class LitModel(pl.LightningModule):
    def validation_step(self, batch, batch_idx):
        x, y = batch
        y_hat = self.model(x)

        # Log images (first batch only)
        if batch_idx == 0:
            self.logger.experiment.log({
                "examples": [wandb.Image(img) for img in x[:8]]
            })

        return loss

    def on_validation_epoch_end(self):
        # Log confusion matrix
        cm = compute_confusion_matrix(self.all_preds, self.all_targets)

        self.logger.experiment.log({
            "confusion_matrix": wandb.plot.confusion_matrix(
                probs=None,
                y_true=self.all_targets,
                preds=self.all_preds,
                class_names=self.class_names
            )
        })
```

### Hyperparameter Sweeps

```python
import pytorch_lightning as pl
from pytorch_lightning.loggers import WandbLogger
import wandb

# Define sweep
sweep_config = {
    'method': 'bayes',
    'metric': {'name': 'val/accuracy', 'goal': 'maximize'},
    'parameters': {
        'learning_rate': {'min': 1e-5, 'max': 1e-2, 'distribution': 'log_uniform'},
        'batch_size': {'values': [16, 32, 64]},
        'hidden_size': {'values': [128, 256, 512]}
    }
}

sweep_id = wandb.sweep(sweep_config, project="lightning-sweeps")

def train():
    # Initialize W&B
    run = wandb.init()

    # Get hyperparameters
    config = wandb.config

    # Create logger
    wandb_logger = WandbLogger()

    # Create model with sweep params
    model = LitModel(
        learning_rate=config.learning_rate,
        hidden_size=config.hidden_size
    )

    # Create datamodule with sweep batch size
    dm = DataModule(batch_size=config.batch_size)

    # Train
    trainer = pl.Trainer(logger=wandb_logger, max_epochs=10)
    trainer.fit(model, dm)

# Run sweep
wandb.agent(sweep_id, function=train, count=30)
```

## Keras/TensorFlow

### With Callback

```python
import tensorflow as tf
from wandb.keras import WandbCallback
import wandb

# Initialize W&B
wandb.init(
    project="keras-demo",
    config={
        "learning_rate": 0.001,
        "epochs": 10,
        "batch_size": 32
    }
)

config = wandb.config

# Build model
model = tf.keras.Sequential([
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.2),
    tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(config.learning_rate),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# Train with W&B callback
history = model.fit(
    x_train, y_train,
    validation_data=(x_val, y_val),
    epochs=config.epochs,
    batch_size=config.batch_size,
    callbacks=[
        WandbCallback(
            log_weights=True,      # Log model weights
            log_gradients=True,    # Log gradients
            training_data=(x_train, y_train),
            validation_data=(x_val, y_val),
            labels=class_names
        )
    ]
)

# Save model as artifact
model.save('model.h5')
artifact = wandb.Artifact('keras-model', type='model')
artifact.add_file('model.h5')
wandb.log_artifact(artifact)

wandb.finish()
```

### Custom Training Loop

```python
import tensorflow as tf
import wandb

wandb.init(project="tf-custom-loop")

# Model, optimizer, loss
model = create_model()
optimizer = tf.keras.optimizers.Adam(1e-3)
loss_fn = tf.keras.losses.SparseCategoricalCrossentropy()

# Metrics
train_loss = tf.keras.metrics.Mean(name='train_loss')
train_accuracy = tf.keras.metrics.SparseCategoricalAccuracy(name='train_accuracy')

@tf.function
def train_step(x, y):
    with tf.GradientTape() as tape:
        predictions = model(x, training=True)
        loss = loss_fn(y, predictions)

    gradients = tape.gradient(loss, model.trainable_variables)
    optimizer.apply_gradients(zip(gradients, model.trainable_variables))

    train_loss(loss)
    train_accuracy(y, predictions)

# Training loop
for epoch in range(EPOCHS):
    train_loss.reset_states()
    train_accuracy.reset_states()

    for step, (x, y) in enumerate(train_dataset):
        train_step(x, y)

        # Log every 100 steps
        if step % 100 == 0:
            wandb.log({
                'train/loss': train_loss.result().numpy(),
                'train/accuracy': train_accuracy.result().numpy(),
                'epoch': epoch,
                'step': step
            })

    # Log epoch metrics
    wandb.log({
        'epoch/train_loss': train_loss.result().numpy(),
        'epoch/train_accuracy': train_accuracy.result().numpy(),
        'epoch': epoch
    })

wandb.finish()
```

## Fast.ai

### With Callback

```python
from fastai.vision.all import *
from fastai.callback.wandb import *
import wandb

# Initialize W&B
wandb.init(project="fastai-demo")

# Create data loaders
dls = ImageDataLoaders.from_folder(
    path,
    train='train',
    valid='valid',
    bs=64
)

# Create learner with W&B callback
learn = vision_learner(
    dls,
    resnet34,
    metrics=accuracy,
    cbs=WandbCallback(
        log_preds=True,     # Log predictions
        log_model=True,     # Log model as artifact
        log_dataset=True    # Log dataset as artifact
    )
)

# Train (metrics logged automatically)
learn.fine_tune(5)

wandb.finish()
```

## XGBoost/LightGBM

### XGBoost

```python
import xgboost as xgb
import wandb

# Initialize W&B
run = wandb.init(project="xgboost-demo", config={
    "max_depth": 6,
    "learning_rate": 0.1,
    "n_estimators": 100
})

config = wandb.config

# Create DMatrix
dtrain = xgb.DMatrix(X_train, label=y_train)
dval = xgb.DMatrix(X_val, label=y_val)

# XGBoost params
params = {
    'max_depth': config.max_depth,
    'learning_rate': config.learning_rate,
    'objective': 'binary:logistic',
    'eval_metric': ['logloss', 'auc']
}

# Custom callback for W&B
def wandb_callback(env):
    """Log XGBoost metrics to W&B."""
    for metric_name, metric_value in env.evaluation_result_list:
        wandb.log({
            f"{metric_name}": metric_value,
            "iteration": env.iteration
        })

# Train with callback
model = xgb.train(
    params,
    dtrain,
    num_boost_round=config.n_estimators,
    evals=[(dtrain, 'train'), (dval, 'val')],
    callbacks=[wandb_callback],
    verbose_eval=10
)

# Save model
model.save_model('xgboost_model.json')
artifact = wandb.Artifact('xgboost-model', type='model')
artifact.add_file('xgboost_model.json')
wandb.log_artifact(artifact)

wandb.finish()
```

### LightGBM

```python
import lightgbm as lgb
import wandb

run = wandb.init(project="lgbm-demo")

# Create datasets
train_data = lgb.Dataset(X_train, label=y_train)
val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)

# Parameters
params = {
    'objective': 'binary',
    'metric': ['binary_logloss', 'auc'],
    'learning_rate': 0.1,
    'num_leaves': 31
}

# Custom callback
def log_to_wandb(env):
    """Log LightGBM metrics to W&B."""
    for entry in env.evaluation_result_list:
        dataset_name, metric_name, metric_value, _ = entry
        wandb.log({
            f"{dataset_name}/{metric_name}": metric_value,
            "iteration": env.iteration
        })

# Train
model = lgb.train(
    params,
    train_data,
    num_boost_round=100,
    valid_sets=[train_data, val_data],
    valid_names=['train', 'val'],
    callbacks=[log_to_wandb]
)

# Save model
model.save_model('lgbm_model.txt')
artifact = wandb.Artifact('lgbm-model', type='model')
artifact.add_file('lgbm_model.txt')
wandb.log_artifact(artifact)

wandb.finish()
```

## PyTorch Native

### Training Loop Integration

```python
import torch
import torch.nn as nn
import torch.optim as optim
import wandb

# Initialize W&B
wandb.init(project="pytorch-native", config={
    "learning_rate": 0.001,
    "epochs": 10,
    "batch_size": 32
})

config = wandb.config

# Model, loss, optimizer
model = create_model()
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=config.learning_rate)

# Watch model (logs gradients and parameters)
wandb.watch(model, criterion, log="all", log_freq=100)

# Training loop
for epoch in range(config.epochs):
    model.train()
    train_loss = 0.0
    correct = 0
    total = 0

    for batch_idx, (data, target) in enumerate(train_loader):
        data, target = data.to(device), target.to(device)

        # Forward pass
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)

        # Backward pass
        loss.backward()
        optimizer.step()

        # Track metrics
        train_loss += loss.item()
        _, predicted = output.max(1)
        total += target.size(0)
        correct += predicted.eq(target).sum().item()

        # Log every 100 batches
        if batch_idx % 100 == 0:
            wandb.log({
                'train/loss': loss.item(),
                'train/batch_accuracy': 100. * correct / total,
                'epoch': epoch,
                'batch': batch_idx
            })

    # Validation
    model.eval()
    val_loss = 0.0
    val_correct = 0
    val_total = 0

    with torch.no_grad():
        for data, target in val_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            loss = criterion(output, target)

            val_loss += loss.item()
            _, predicted = output.max(1)
            val_total += target.size(0)
            val_correct += predicted.eq(target).sum().item()

    # Log epoch metrics
    wandb.log({
        'epoch/train_loss': train_loss / len(train_loader),
        'epoch/train_accuracy': 100. * correct / total,
        'epoch/val_loss': val_loss / len(val_loader),
        'epoch/val_accuracy': 100. * val_correct / val_total,
        'epoch': epoch
    })

# Save final model
torch.save(model.state_dict(), 'model.pth')
artifact = wandb.Artifact('final-model', type='model')
artifact.add_file('model.pth')
wandb.log_artifact(artifact)

wandb.finish()
```

## Custom Integrations

### Generic Framework Integration

```python
import wandb

class WandbIntegration:
    """Generic W&B integration wrapper."""

    def __init__(self, project, config):
        self.run = wandb.init(project=project, config=config)
        self.config = wandb.config
        self.step = 0

    def log_metrics(self, metrics, step=None):
        """Log training metrics."""
        if step is None:
            step = self.step
            self.step += 1

        wandb.log(metrics, step=step)

    def log_images(self, images, caption=""):
        """Log images."""
        wandb.log({
            caption: [wandb.Image(img) for img in images]
        })

    def log_table(self, data, columns):
        """Log tabular data."""
        table = wandb.Table(columns=columns, data=data)
        wandb.log({"table": table})

    def save_model(self, model_path, metadata=None):
        """Save model as artifact."""
        artifact = wandb.Artifact(
            'model',
            type='model',
            metadata=metadata or {}
        )
        artifact.add_file(model_path)
        self.run.log_artifact(artifact)

    def finish(self):
        """Finish W&B run."""
        wandb.finish()

# Usage
wb = WandbIntegration(project="my-project", config={"lr": 0.001})

# Training loop
for epoch in range(10):
    # Your training code
    loss, accuracy = train_epoch()

    # Log metrics
    wb.log_metrics({
        'train/loss': loss,
        'train/accuracy': accuracy
    })

# Save model
wb.save_model('model.pth', metadata={'accuracy': 0.95})
wb.finish()
```

## Resources

- **Integrations Guide**: https://docs.wandb.ai/guides/integrations
- **HuggingFace**: https://docs.wandb.ai/guides/integrations/huggingface
- **PyTorch Lightning**: https://docs.wandb.ai/guides/integrations/lightning
- **Keras**: https://docs.wandb.ai/guides/integrations/keras
- **Examples**: https://github.com/wandb/examples
