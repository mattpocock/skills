# Pytorch-Fsdp - Other

**Pages:** 15

---

## Distributed Data Parallel#

**URL:** https://pytorch.org/docs/stable/notes/ddp.html

**Contents:**
- Distributed Data Parallel#
- Example#
- Internal Design#
- Implementation#
  - ProcessGroup#
  - DistributedDataParallel#
  - TorchDynamo DDPOptimizer#

Created On: Jan 15, 2020 | Last Updated On: Jan 25, 2024

The implementation of torch.nn.parallel.DistributedDataParallel evolves over time. This design note is written based on the state as of v1.4.

torch.nn.parallel.DistributedDataParallel (DDP) transparently performs distributed data parallel training. This page describes how it works and reveals implementation details.

Let us start with a simple torch.nn.parallel.DistributedDataParallel example. This example uses a torch.nn.Linear as the local model, wraps it with DDP, and then runs one forward pass, one backward pass, and an optimizer step on the DDP model. After that, parameters on the local model will be updated, and all models on different processes should be exactly the same.

DDP works with TorchDynamo. When used with TorchDynamo, apply the DDP model wrapper before compiling the model, such that torchdynamo can apply DDPOptimizer (graph-break optimizations) based on DDP bucket sizes. (See TorchDynamo DDPOptimizer for more information.)

This section reveals how it works under the hood of torch.nn.parallel.DistributedDataParallel by diving into details of every step in one iteration.

Prerequisite: DDP relies on c10d ProcessGroup for communications. Hence, applications must create ProcessGroup instances before constructing DDP.

Construction: The DDP constructor takes a reference to the local module, and broadcasts state_dict() from the process with rank 0 to all other processes in the group to make sure that all model replicas start from the exact same state. Then, each DDP process creates a local Reducer, which later will take care of the gradients synchronization during the backward pass. To improve communication efficiency, the Reducer organizes parameter gradients into buckets, and reduces one bucket at a time. Bucket size can be configured by setting the bucket_cap_mb argument in DDP constructor. The mapping from parameter gradients to buckets is determined at the construction time, based on the bucket size limit and parameter sizes. Model parameters are allocated into buckets in (roughly) the reverse order of Model.parameters() from the given model. The reason for using the reverse order is because DDP expects gradients to become ready during the backward pass in approximately that order. The figure below shows an example. Note that, the grad0 and grad1 are in bucket1, and the other two gradients are in bucket0. Of course, this assumption might not always be true, and when that happens it could hurt DDP backward speed as the Reducer cannot kick off the communication at the earliest possible time. Besides bucketing, the Reducer also registers autograd hooks during construction, one hook per parameter. These hooks will be triggered during the backward pass when the gradient becomes ready.

Forward Pass: The DDP takes the input and passes it to the local model, and then analyzes the output from the local model if find_unused_parameters is set to True. This mode allows running backward on a subgraph of the model, and DDP finds out which parameters are involved in the backward pass by traversing the autograd graph from the model output and marking all unused parameters as ready for reduction. During the backward pass, the Reducer would only wait for unready parameters, but it would still reduce all buckets. Marking a parameter gradient as ready does not help DDP skip buckets as for now, but it will prevent DDP from waiting for absent gradients forever during the backward pass. Note that traversing the autograd graph introduces extra overheads, so applications should only set find_unused_parameters to True when necessary.

Backward Pass: The backward() function is directly invoked on the loss Tensor, which is out of DDP’s control, and DDP uses autograd hooks registered at construction time to trigger gradients synchronizations. When one gradient becomes ready, its corresponding DDP hook on that grad accumulator will fire, and DDP will then mark that parameter gradient as ready for reduction. When gradients in one bucket are all ready, the Reducer kicks off an asynchronous allreduce on that bucket to calculate mean of gradients across all processes. When all buckets are ready, the Reducer will block waiting for all allreduce operations to finish. When this is done, averaged gradients are written to the param.grad field of all parameters. So after the backward pass, the grad field on the same corresponding parameter across different DDP processes should be the same.

Optimizer Step: From the optimizer’s perspective, it is optimizing a local model. Model replicas on all DDP processes can keep in sync because they all start from the same state and they have the same averaged gradients in every iteration.

DDP requires Reducer instances on all processes to invoke allreduce in exactly the same order, which is done by always running allreduce in the bucket index order instead of actual bucket ready order. Mismatched allreduce order across processes can lead to wrong results or DDP backward hang.

Below are pointers to the DDP implementation components. The stacked graph shows the structure of the code.

ProcessGroup.hpp: contains the abstract API of all process group implementations. The c10d library provides 3 implementations out of the box, namely, ProcessGroupGloo, ProcessGroupNCCL, and ProcessGroupMPI. DistributedDataParallel uses ProcessGroup::broadcast() to send model states from the process with rank 0 to others during initialization and ProcessGroup::allreduce() to sum gradients.

Store.hpp: assists the rendezvous service for process group instances to find each other.

distributed.py: is the Python entry point for DDP. It implements the initialization steps and the forward function for the nn.parallel.DistributedDataParallel module which call into C++ libraries. Its _sync_param function performs intra-process parameter synchronization when one DDP process works on multiple devices, and it also broadcasts model buffers from the process with rank 0 to all other processes. The inter-process parameter synchronization happens in Reducer.cpp.

comm.h: implements the coalesced broadcast helper function which is invoked to broadcast model states during initialization and synchronize model buffers before the forward pass.

reducer.h: provides the core implementation for gradient synchronization in the backward pass. It has three entry point functions:

Reducer: The constructor is called in distributed.py which registers Reducer::autograd_hook() to gradient accumulators.

autograd_hook() function will be invoked by the autograd engine when a gradient becomes ready.

prepare_for_backward() is called at the end of DDP forward pass in distributed.py. It traverses the autograd graph to find unused parameters when find_unused_parameters is set to True in DDP constructor.

DDP’s performance advantage comes from overlapping allreduce collectives with computations during backwards. AotAutograd prevents this overlap when used with TorchDynamo for compiling a whole forward and whole backward graph, because allreduce ops are launched by autograd hooks _after_ the whole optimized backwards computation finishes.

TorchDynamo’s DDPOptimizer helps by breaking the forward graph at the logical boundaries of DDP’s allreduce buckets during backwards. Note: the goal is to break the graph during backwards, and the simplest implementation is to break the forward graphs and then call AotAutograd and compilation on each section. This allows DDP’s allreduce hooks to fire in-between sections of backwards, and schedule communications to overlap with compute.

See this blog post for a more in-depth explanation and experimental results, or read the docs and code at torch/_dynamo/optimizations/distributed.py

To Debug DDPOptimizer, set TORCH_LOGS=’ddp_graphs’ for full graph dumps. For logs without graphs, add any of ‘dynamo’, ‘distributed’, or ‘dist_ddp’ to TORCH_LOGS (for basic info about bucket boundaries). To disable DDPOptimizer, set torch._dynamo.config.optimize_ddp=False. DDP and TorchDynamo should still work correctly without DDPOptimizer, but with performance degradation.

---

## PyTorch documentation#

**URL:** https://pytorch.org/docs/stable/

**Contents:**
- PyTorch documentation#
- Indices and tables#

PyTorch is an optimized tensor library for deep learning using GPUs and CPUs.

Features described in this documentation are classified by release status:

Stable (API-Stable): These features will be maintained long-term and there should generally be no major performance limitations or gaps in documentation. We also expect to maintain backwards compatibility (although breaking changes can happen and notice will be given one release ahead of time).

Unstable (API-Unstable): Encompasses all features that are under active development where APIs may change based on user feedback, requisite performance improvements or because coverage across operators is not yet complete. The APIs and performance characteristics of these features may change.

---

## Generic Join Context Manager#

**URL:** https://pytorch.org/docs/stable/distributed.algorithms.join.html

**Contents:**
- Generic Join Context Manager#

Created On: Jun 06, 2025 | Last Updated On: Jun 06, 2025

The generic join context manager facilitates distributed training on uneven inputs. This page outlines the API of the relevant classes: Join, Joinable, and JoinHook. For a tutorial, see Distributed Training with Uneven Inputs Using the Join Context Manager.

This class defines the generic join context manager, which allows custom hooks to be called after a process joins.

These hooks should shadow the collective communications of non-joined processes to prevent hanging and erroring and to ensure algorithmic correctness. Refer to JoinHook for details about the hook definition.

The context manager requires each participating Joinable to call the method notify_join_context() before its own per- iteration collective communications to ensure correctness.

The context manager requires that all process_group attributes in the JoinHook objects are the same. If there are multiple JoinHook objects, then the device of the first is used. The process group and device information is used for checking for non- joined processes and for notifying processes to throw an exception if throw_on_early_termination is enabled, both of which using an all- reduce.

joinables (List[Joinable]) – a list of the participating Joinable s; their hooks are iterated over in the given order.

enable (bool) – a flag enabling uneven input detection; setting to False disables the context manager’s functionality and should only be set when the user knows the inputs will not be uneven (default: True).

throw_on_early_termination (bool) – a flag controlling whether to throw an exception upon detecting uneven inputs (default: False).

Notifies the join context manager that the calling process has not yet joined.

Then, if throw_on_early_termination=True, checks if uneven inputs have been detected (i.e. if one process has already joined) and throws an exception if so.

This method should be called from a Joinable object before its per-iteration collective communications. For example, this should be called at the beginning of the forward pass in DistributedDataParallel.

Only the first Joinable object passed into the context manager performs the collective communications in this method, and for the others, this method is vacuous.

joinable (Joinable) – the Joinable object calling this method.

An async work handle for the all-reduce meant to notify the context manager that the process has not yet joined if joinable is the first one passed into the context manager; None otherwise.

This defines an abstract base class for joinable classes.

A joinable class (inheriting from Joinable) should implement join_hook(), which returns a JoinHook instance, in addition to join_device() and join_process_group() that return device and process group information, respectively.

Return the device from which to perform collective communications needed by the join context manager.

Return a JoinHook instance for the given Joinable.

kwargs (dict) – a dict containing any keyword arguments to modify the behavior of the join hook at run time; all Joinable instances sharing the same join context manager are forwarded the same value for kwargs.

Returns the process group for the collective communications needed by the join context manager itself.

This defines a join hook, which provides two entry points in the join context manager.

Entry points : a main hook, which is called repeatedly while there exists a non-joined process, and a post-hook, which is called once all processes have joined.

To implement a join hook for the generic join context manager, define a class that inherits from JoinHook and override main_hook() and post_hook() as appropriate.

Call this hook while there exists a non-joined process to shadow collective communications in a training iteration.

Training iteration i.e., in one forward pass, backward pass, and optimizer step.

Call hook after all processes have joined.

It is passed an additional bool argument is_last_joiner, which indicates if the rank is one of the last to join.

is_last_joiner (bool) – True if the rank is one of the last to join; False otherwise.

---

## Experimental Object Oriented Distributed API#

**URL:** https://pytorch.org/docs/stable/distributed._dist2.html

**Contents:**
- Experimental Object Oriented Distributed API#

Created On: Jul 09, 2025 | Last Updated On: Jul 30, 2025

This is an experimental new API for PyTorch Distributed. This is actively in development and subject to change or deletion entirely.

This is intended as a proving ground for more flexible and object oriented distributed APIs.

Bases: pybind11_object

A ProcessGroup is a communication primitive that allows for collective operations across a group of processes.

This is a base class that provides the interface for all ProcessGroups. It is not meant to be used directly, but rather extended by subclasses.

Bases: pybind11_object

The type of the backend used for the process group.

abort all operations and connections if supported by the backend

allgather(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[collections.abc.Sequence[torch.Tensor]], input_tensors: collections.abc.Sequence[torch.Tensor], opts: torch._C._distributed_c10d.AllgatherOptions = <torch._C._distributed_c10d.AllgatherOptions object at 0x7f0162b6b9b0>) -> c10d::Work

Allgathers the input tensors from all processes across the process group.

See torch.distributed.all_gather() for more details.

allgather(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[torch.Tensor], input_tensor: torch.Tensor, timeout: datetime.timedelta | None = None) -> c10d::Work

Allgathers the input tensors from all processes across the process group.

See torch.distributed.all_gather() for more details.

Allgathers the input tensors from all processes across the process group.

See torch.distributed.all_gather() for more details.

Allgathers the input tensors from all processes across the process group.

See torch.distributed.all_gather() for more details.

allreduce(self: torch._C._distributed_c10d.ProcessGroup, tensors: collections.abc.Sequence[torch.Tensor], opts: torch._C._distributed_c10d.AllreduceOptions = <torch._C._distributed_c10d.AllreduceOptions object at 0x7f0162745db0>) -> c10d::Work

Allreduces the provided tensors across all processes in the process group.

See torch.distributed.all_reduce() for more details.

allreduce(self: torch._C._distributed_c10d.ProcessGroup, tensors: collections.abc.Sequence[torch.Tensor], op: torch._C._distributed_c10d.ReduceOp = <RedOpType.SUM: 0>, timeout: datetime.timedelta | None = None) -> c10d::Work

Allreduces the provided tensors across all processes in the process group.

See torch.distributed.all_reduce() for more details.

allreduce(self: torch._C._distributed_c10d.ProcessGroup, tensor: torch.Tensor, op: torch._C._distributed_c10d.ReduceOp = <RedOpType.SUM: 0>, timeout: datetime.timedelta | None = None) -> c10d::Work

Allreduces the provided tensors across all processes in the process group.

See torch.distributed.all_reduce() for more details.

Allreduces the provided tensors across all processes in the process group.

See torch.distributed.all_reduce() for more details.

Alltoalls the input tensors from all processes across the process group.

See torch.distributed.all_to_all() for more details.

alltoall_base(self: torch._C._distributed_c10d.ProcessGroup, output: torch.Tensor, input: torch.Tensor, output_split_sizes: collections.abc.Sequence[typing.SupportsInt], input_split_sizes: collections.abc.Sequence[typing.SupportsInt], opts: torch._C._distributed_c10d.AllToAllOptions = <torch._C._distributed_c10d.AllToAllOptions object at 0x7f0162b79d30>) -> c10d::Work

Alltoalls the input tensors from all processes across the process group.

See torch.distributed.all_to_all() for more details.

alltoall_base(self: torch._C._distributed_c10d.ProcessGroup, output: torch.Tensor, input: torch.Tensor, output_split_sizes: collections.abc.Sequence[typing.SupportsInt], input_split_sizes: collections.abc.Sequence[typing.SupportsInt], timeout: datetime.timedelta | None = None) -> c10d::Work

Alltoalls the input tensors from all processes across the process group.

See torch.distributed.all_to_all() for more details.

barrier(self: torch._C._distributed_c10d.ProcessGroup, opts: torch._C._distributed_c10d.BarrierOptions = <torch._C._distributed_c10d.BarrierOptions object at 0x7f0162745ab0>) -> c10d::Work

then all leave the call together.

See torch.distributed.barrier() for more details.

barrier(self: torch._C._distributed_c10d.ProcessGroup, timeout: datetime.timedelta | None = None) -> c10d::Work

then all leave the call together.

See torch.distributed.barrier() for more details.

broadcast(self: torch._C._distributed_c10d.ProcessGroup, tensors: collections.abc.Sequence[torch.Tensor], opts: torch._C._distributed_c10d.BroadcastOptions = <torch._C._distributed_c10d.BroadcastOptions object at 0x7f0162b7afb0>) -> c10d::Work

Broadcasts the tensor to all processes in the process group.

See torch.distributed.broadcast() for more details.

broadcast(self: torch._C._distributed_c10d.ProcessGroup, tensor: torch.Tensor, root: typing.SupportsInt, timeout: datetime.timedelta | None = None) -> c10d::Work

Broadcasts the tensor to all processes in the process group.

See torch.distributed.broadcast() for more details.

gather(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[collections.abc.Sequence[torch.Tensor]], input_tensors: collections.abc.Sequence[torch.Tensor], opts: torch._C._distributed_c10d.GatherOptions = <torch._C._distributed_c10d.GatherOptions object at 0x7f0162c301f0>) -> c10d::Work

Gathers the input tensors from all processes across the process group.

See torch.distributed.gather() for more details.

gather(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[torch.Tensor], input_tensor: torch.Tensor, root: typing.SupportsInt, timeout: datetime.timedelta | None = None) -> c10d::Work

Gathers the input tensors from all processes across the process group.

See torch.distributed.gather() for more details.

Get the store of this process group.

Gets this process group description

(Gets this process group name. It’s cluster unique)

then all leave the call together.

See torch.distributed.monitored_barrier() for more details.

Get the name of this process group.

Get the rank of this process group.

Receives the tensor from the specified rank.

See torch.distributed.recv() for more details.

Receives the tensor from any source.

See torch.distributed.recv() for more details.

reduce(self: torch._C._distributed_c10d.ProcessGroup, tensors: collections.abc.Sequence[torch.Tensor], opts: torch._C._distributed_c10d.ReduceOptions = <torch._C._distributed_c10d.ReduceOptions object at 0x7f0162bce3f0>) -> c10d::Work

Reduces the provided tensors across all processes in the process group.

See torch.distributed.reduce() for more details.

reduce(self: torch._C._distributed_c10d.ProcessGroup, tensor: torch.Tensor, root: typing.SupportsInt, op: torch._C._distributed_c10d.ReduceOp = <RedOpType.SUM: 0>, timeout: datetime.timedelta | None = None) -> c10d::Work

Reduces the provided tensors across all processes in the process group.

See torch.distributed.reduce() for more details.

reduce_scatter(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[torch.Tensor], input_tensors: collections.abc.Sequence[collections.abc.Sequence[torch.Tensor]], opts: torch._C._distributed_c10d.ReduceScatterOptions = <torch._C._distributed_c10d.ReduceScatterOptions object at 0x7f0162ee5cf0>) -> c10d::Work

Reduces and scatters the input tensors from all processes across the process group.

See torch.distributed.reduce_scatter() for more details.

reduce_scatter(self: torch._C._distributed_c10d.ProcessGroup, output: torch.Tensor, input: collections.abc.Sequence[torch.Tensor], op: torch._C._distributed_c10d.ReduceOp = <RedOpType.SUM: 0>, timeout: datetime.timedelta | None = None) -> c10d::Work

Reduces and scatters the input tensors from all processes across the process group.

See torch.distributed.reduce_scatter() for more details.

Reduces and scatters the input tensors from all processes across the process group.

See torch.distributed.reduce_scatter() for more details.

scatter(self: torch._C._distributed_c10d.ProcessGroup, output_tensors: collections.abc.Sequence[torch.Tensor], input_tensors: collections.abc.Sequence[collections.abc.Sequence[torch.Tensor]], opts: torch._C._distributed_c10d.ScatterOptions = <torch._C._distributed_c10d.ScatterOptions object at 0x7f0162b879f0>) -> c10d::Work

Scatters the input tensors from all processes across the process group.

See torch.distributed.scatter() for more details.

scatter(self: torch._C._distributed_c10d.ProcessGroup, output_tensor: torch.Tensor, input_tensors: collections.abc.Sequence[torch.Tensor], root: typing.SupportsInt, timeout: datetime.timedelta | None = None) -> c10d::Work

Scatters the input tensors from all processes across the process group.

See torch.distributed.scatter() for more details.

Sends the tensor to the specified rank.

See torch.distributed.send() for more details.

Sets the default timeout for all future operations.

shutdown the process group

Get the size of this process group.

Protocol for process group factories.

Get the current process group. Thread local method.

The current process group.

Create a new process group with the given backend and options. This group is independent and will not be globally registered and thus not usable via the standard torch.distributed.* APIs.

backend (str) – The backend to use for the process group.

timeout (timedelta) – The timeout for collective operations.

device (Union[str, device]) – The device to use for the process group.

**kwargs (object) – All remaining arguments are passed to the backend constructor. See the backend specific documentation for details.

Context manager for process groups. Thread local method.

pg (ProcessGroup) – The process group to use.

Generator[None, None, None]

Register a new process group backend.

name (str) – The name of the backend.

func (ProcessGroupFactory) – The function to create the process group.

---

## torch.distributed.fsdp.fully_shard#

**URL:** https://pytorch.org/docs/stable/distributed.fsdp.fully_shard.html

**Contents:**
- torch.distributed.fsdp.fully_shard#
- PyTorch FSDP2 (fully_shard)#

Created On: Dec 04, 2024 | Last Updated On: Jun 16, 2025

PyTorch FSDP2 (RFC) provides a fully sharded data parallelism (FSDP) implementation targeting performant eager-mode while using per-parameter sharding for improved usability

See the Getting Started with FSDP2 tutorial for more information.

If you are currently using FSDP1, consider migrating to FSDP2 using our migration guide.

The user contract for fully_shard(model) is as follows

For model initialization, fully_shard converts model.parameters() from plain torch.Tensor to DTensor in-place. The parameters are moved to the appropriate device according to the device mesh.

Before forward and backward passes, pre-forward/backward hooks are responsible for all-gathering the parameters and converting model.parameters() from DTensor to plain torch.Tensor.

After forward and backward passes, post-forward/backward hooks free the unsharded parameters (no communication needed) and convert model.parameters() from plain torch.Tensor back to DTensor.

For the optimizer, it must be initialized with the DTensor model.parameters(), and the optimizer step should be performed on DTensor parameters.

Call model(input) instead of model.forward(input) to trigger pre-forward hooks to all-gather parameters. To make model.forward(input) work, users must either call model.unshard() explicitly or use register_fsdp_forward_method(model, "forward") to register the forward method for hooking.

fully_shard groups parameters together for a single all-gather. User should apply fully_shard in a bottom-up manner. For example, in a Transformer model, fully_shard should be applied to each layer before applying it to the root model. When applied to the root model, fully_shard excludes model.parameters() from each layer and groups the remaining parameters (e.g., embeddings, output projection) into a single all-gather group.

type(model) is “unioned” with FSDPModule in-place. For example, if model is originally of type nn.Linear, then fully_shard changes type(model) from nn.Linear to FSDPLinear in-place. FSDPLinear is an instance of both nn.Linear and FSDPModule. It retains all methods of nn.Linear while also exposing FSDP2-specific APIs under FSDPModule, such as reshard() and unshard().

Fully Qualified Names (FQNs) for parameters remain unchanged. If we call model.state_dict(), the FQNs are the same before and after applying fully_shard. This is because fully_shard does not wrap the module but only registers hooks to the original module.

Compared to PyTorch FSDP1 (FullyShardedDataParallel):

FSDP2 uses DTensor-based dim-0 per-parameter sharding for a simpler sharding representation compared to FSDP1’s flat-parameter sharding, while preserving similar throughput performance. More specifically, FSDP2 chunks each parameter on dim-0 across the data parallel workers (using torch.chunk(dim=0)), whereas FSDP1 flattens, concatenates, and chunks a group of tensors together, making reasoning about what data is present on each worker and resharding to different parallelisms complex. Per-parameter sharding provides a more intuitive user experience, relaxes constraints around frozen parameters, and allows for communication-free (sharded) state dicts, which otherwise require all-gathers in FSDP1.

FSDP2 implements a different memory management approach to handle the multi-stream usages that avoids torch.Tensor.record_stream. This ensures deterministic and expected memory usage and does not require blocking the CPU like in FSDP1’s limit_all_gathers=True.

FSDP2 exposes APIs for manual control over prefetching and collective scheduling, allowing power users more customization. See the methods on FSDPModule below for details.

FSDP2 simplifies some of the API surface: e.g. FSDP2 does not directly support full state dicts. Instead, users can reshard the sharded state dicts containing DTensor s to full state dicts themselves using DTensor APIs like DTensor.full_tensor() or by using higher-level APIs like PyTorch Distributed Checkpoint ‘s distributed state dict APIs. Also, some other args have been removed; see here for details.

The frontend API is fully_shard that can be called on a module:

Apply fully sharded data parallelism (FSDP) to module, where FSDP shards module parameters, gradients, and optimizer states across data parallel workers to save memory at the cost of communication.

At initialization, FSDP shards the module’s parameters across the data parallel workers given by mesh. Before forward, FSDP all-gathers the sharded parameters across the data-parallel workers to get the unsharded parameters for forward computation. If reshard_after_forward is True, then FSDP frees the unsharded parameters after forward and re-all-gathers them in backward before gradient computation. After gradient computation, FSDP frees the unsharded parameters and reduce-scatters the unsharded gradients across data-parallel workers.

This implementation represents the sharded parameters as DTensor s sharded on dim-0, while the unsharded parameters will be like the original parameters on module (e.g. torch.Tensor if originally torch.Tensor). A module forward pre-hook on module all-gathers the parameters, and a module forward hook on module frees them (if needed). Similar backward hooks all-gather parameters and later free parameters and reduce-scatter gradients.

Since grouping multiple tensors together for one collective is critical for communication efficiency, this implementation makes this grouping first class. Calling fully_shard() on module constructs one group that includes the parameters in module.parameters() except those already assigned to a group from an earlier call on a submodule. This means that fully_shard() should be called bottom-up on your model. Each group’s parameters are all-gathered in one collective, and its gradients are reduce-scattered in one collective. Partitioning the model into multiple groups (“layer by layer”) allows for peak memory savings and communication/computation overlap. Users generally should not call fully_shard() only on the topmost root module.

module (Union[nn.Module, List[nn.Module]) – The module or modules to shard with FSDP and group together for communication.

mesh (Optional[DeviceMesh]) – This data parallel mesh defines the sharding and device. If 1D, then parameters are fully sharded across the 1D mesh (FSDP) with (Shard(0),) placement. If 2D, then parameters are sharded across the 1st dim and replicated across the 0th dim (HSDP) with (Replicate(), Shard(0)) placement. The mesh’s device type gives the device type used for communication; if a CUDA or CUDA-like device type, then we use the current device.

reshard_after_forward (Optional[Union[bool, int]]) – This controls the parameter behavior after forward and can trade off memory and communication: If True, then this reshards parameters after forward and re-all-gathers in backward. If False, then this keeps the unsharded parameters in memory after forward and avoids the all-gather in backward. For best performance, we usually set False for the root module, because the root module is typically required immediately when the backward pass begins. If None, it is set to True for non-root modules and False for root modules. If an int, then this represents the world size to reshard to after forward. It should be a non-trivial divisor of the mesh shard dim size (i.e. excluding 1 and the dim size itself). A choice may be the intra-node size (e.g. torch.cuda.device_count()). This allows the all-gather in backward to be over a smaller world size at the cost of higher memory usage than setting to True. After forward, the parameters registered to the module depend on to this: The registered parameters are the sharded parameters if True; unsharded parameters if False; and the parameters resharded to the smaller mesh otherwise. To modify the parameters between forward and backward, the registered parameters must be the sharded parameters. For False or an int, this can be done by manually resharding via reshard().

This controls the parameter behavior after forward and can trade off memory and communication:

If True, then this reshards parameters after forward and re-all-gathers in backward.

If False, then this keeps the unsharded parameters in memory after forward and avoids the all-gather in backward. For best performance, we usually set False for the root module, because the root module is typically required immediately when the backward pass begins.

If None, it is set to True for non-root modules and False for root modules.

If an int, then this represents the world size to reshard to after forward. It should be a non-trivial divisor of the mesh shard dim size (i.e. excluding 1 and the dim size itself). A choice may be the intra-node size (e.g. torch.cuda.device_count()). This allows the all-gather in backward to be over a smaller world size at the cost of higher memory usage than setting to True.

After forward, the parameters registered to the module depend on to this: The registered parameters are the sharded parameters if True; unsharded parameters if False; and the parameters resharded to the smaller mesh otherwise. To modify the parameters between forward and backward, the registered parameters must be the sharded parameters. For False or an int, this can be done by manually resharding via reshard().

shard_placement_fn (Optional[Callable[[nn.Parameter], Optional[Shard]]]) – This callable can be used to override the sharding placement for a parameter to shard a parameter on a dimension other than dim-0. If this callable returns a Shard placement (not None), then FSDP will shard according to that placement (e.g. Shard(1)). If sharding on a nonzero dim, we currently require even sharding, i.e. the tensor dim size on that dim must be divisible by the FSDP shard mesh size.

mp_policy (MixedPrecisionPolicy) – This controls the mixed precision policy, which offers parameter/reduction mixed precision for this module. See MixedPrecisionPolicy for details.

offload_policy (OffloadPolicy) – This controls the offloading policy, which offers parameter/gradient/optimizer state offloading. See OffloadPolicy and its subclasses for details.

ignored_params (Optional[set[nn.Parameter]]) – Optional(Set[nn.Parameter]): The set of parameters to be ignored by FSDP. They will not be sharded, nor moved to the device during init, nor have their gradients reduced in backward.

The module with FSDP applied (in-place).

Reshards the module’s parameters, freeing the unsharded parameters if they are allocated and registering the sharded parameters to the module. This method is not recursive.

hook (Callable[[torch.Tensor], None]) – User-defined all-reduce hook with expected signature hook(reduce_output: torch.Tensor) -> None where reduce_output is the reduce-scatter output if only using FSDP or the all-reduce output if using native HSDP.

stream (Optional[torch.cuda.Stream]) – Stream to run the all-reduce hook in. This should only be set if not using native HSDP. If using native HSDP, the hook will run in the internally defined all-reduce stream used by the native HSDP all-reduce.

Sets whether the temporary staging buffers used to send and receive data over collective communications should be allocated using the custom optimized allocator provided by the ProcessGroup itself (if any). This might allow the ProcessGroup to be more efficient. For example, when using NCCL, this enables it to leverage zero-copy transfers over SHARP (for NVLink and/or InfiniBand).

This cannot be used together with set_custom_all_gather() or set_custom_reduce_scatter() as those APIs allow for finer-grained control over each communication, and this method cannot determine their staging buffer allocation strategy.

enable (bool) – Whether to turn on ProcessGroup allocation.

Overrides the default all_gather communication behavior, to have better control over the communication and memory usage. See Comm and ReduceScatter for details.

comm (AllGather) – Custom all-gather communication.

Overrides the default reduce_scatter communication behavior, to have better control over the communication and memory usage. See Comm and ReduceScatter for details.

comm (ReduceScatter) – Custom reduce_scatter communication.

Sets whether to require the low-level collective communication primitives to exclusively use “sum”-type reductions, even if it comes at the cost of separate additional pre- or post-scaling operations. This is needed for example because NCCL currently supports zero-copy transfers only for this kind of collectives.

NB: for MTIA devices, this is always implicitly enabled.

NB: if set_all_reduce_hook is used under FSDP setup, the caller needs to ensure the custom all-reduce across FSDP units follow this strategy as well, as FSDP can no longer automatically handle that.

enable (bool) – Whether to only ever use ReduceOp.SUM for comms.

Sets a custom divide factor for the gradient reduction. This might use a custom reduce op using NCCL’s PreMulSum, which allows multiplying by the factor before reduction.

factor (float) – Custom divide factor.

Sets whether the next backward is the last one. On the last backward, FSDP waits on pending gradient reduction and clears internal data data structures for backward prefetching. This can be useful for microbatching.

Sets the FSDP modules for which this FSDP module should explicitly prefetch all-gathers in backward. This overrides the default backward pretching implementation that prefetches the next FSDP module based on the reverse post-forward order.

Passing a singleton list containing the previous FSDP module gives the same all-gather overlap behavior as the default overlap behavior. Passing a list with at least length two is required for more aggressive overlap and will use more reserved memory.

modules (List[FSDPModule]) – FSDP modules to prefetch.

Sets the FSDP modules for which this FSDP module should explicitly prefetch all-gathers in forward. The prefetching runs after this module’s all-gather copy-out.

Passing a singleton list containing the next FSDP module gives the same all-gather overlap behavior as the default overlap behavior, except the prefetched all-gather is issued earlier from the CPU. Passing a list with at least length two is required for more aggressive overlap and will use more reserved memory.

modules (List[FSDPModule]) – FSDP modules to prefetch.

Sets a post-optimizer-step event for the root FSDP module to wait the all-gather streams on.

By default, the root FSDP module waits the all-gather streams on the current stream to ensure that the optimizer step has finished before all-gathering. However, this may introduce false dependencies if there is unrelated computation after the optimizer step. This API allows the user to provide their own event to wait on. After the root waits on the event, the event is discarded, so this API should be called with a new event each iteration.

event (torch.Event) – Event recorded after the optimizer step to wait all-gather streams on.

Use set_gradient_divide_factor() instead

Sets if the module should all-reduce gradients. This can be used to implement gradient accumulation with only reduce-scatter but not all-reduce for HSDP.

Sets if the module should sync gradients. This can be used to implement gradient accumulation without communication. For HSDP, this controls both reduce-scatter and all-reduce together. This is the equivalence of no_sync in FSDP1.

requires_gradient_sync (bool) – Whether to reduce gradients for the module’s parameters.

recurse (bool) – Whether to set for all FSDP submodules or just the passed-in module.

Sets if the module should reshard parameters after backward. This can be used during gradient accumulation to trade off higher memory for reduced communication since the unsharded parameters do not need to be re-all-gathered before the next forward.

reshard_after_backward (bool) – Whether to reshard parameters after backward.

recurse (bool) – Whether to set for all FSDP submodules or just the passed-in module.

Sets if the module should reshard parameters after forward. This can be used to change the reshard_after_forward FSDP arg at runtime. For example, this can be used to set the FSDP root module’s value to True (since it is otherwise specially set to False), or it can set an FSDP module’s value to False for running evals and set back to True for training.

reshard_after_forward (bool) – Whether to reshard parameters after forward.

recurse (bool) – Whether to set for all FSDP submodules or just the passed-in module.

Sets whether the FSDP module’s parameters need to be unsharded in backward. This can be used in expert cases when the user knows that all parameters in this FSDP module’s parameter group are not needed for backward computation (e.g. embedding).

Unshards the module’s parameters by allocating memory and all-gathering the parameters. This method is not recursive. The unshard follows the MixedPrecisionPolicy, so it will all-gather following param_dtype if set.

async_op (bool) – If True, then returns a UnshardHandle that has a wait() method to wait on the unshard op. If False, then returns None and waits on the handle inside this function.

Optional[UnshardHandle]

If async_op=True, then FSDP will wait on the pending unshard in the module’s pre-forward for the user. The user only needs to call wait() explicitly if the wait should happen before pre-forward.

A handle to wait on a FSDPModule.unshard() op.

Waits on the unshard op. This ensures that the current stream can use the unsharded parameters, which are now registered to the module.

Registers a method on module to be considered a forward method for FSDP.

FSDP all-gathers parameters pre-forward and optionally frees parameters post-forward (depending on reshard_after_forward). FSDP only knows to do this for nn.Module.forward() by default. This function patches a user-specified method to run the pre/post-forward hooks before/after the method, respectively. If module is not an FSDPModule, then this is a no-op.

module (nn.Module) – Module to register the forward method on.

method_name (str) – Name of the forward method.

This configures FSDP’s mixed precision. Unlike autocast, this applies mixed precision at the module level, not op level, which means low-precision activations are saved for backward and high-to-low-precision casts are incurred only at module boundaries.

FSDP works well with module-level mixed precision since it keeps the high-precision sharded parameters in memory anyway. In other words, FSDP does not require any extra memory to keep a high-precision copy of the parameters for the optimizer step.

param_dtype (Optional[torch.dtype]) – This specifies the dtype for the unsharded parameter and hence the dtype for forward/backward computation and the parameter all-gather. If this is None, then the unsharded parameter uses the original dtype. The optimizer step uses the sharded parameter in the original dtype. (Default: None)

reduce_dtype (Optional[torch.dtype]) – This specifies the dtype for gradient reduction (i.e. reduce-scatter or all-reduce). If this is None but param_dtype is not None, then the reduction uses the compute dtype. This can be used to run gradient reduction in full precision while using low precision for compute. If also gradient reduction is disabled via set_requires_gradient_sync(), then FSDP will accumulate gradients using reduce_dtype. (Default: None)

output_dtype (Optional[torch.dtype]) – This specifies the dtype for casting floating-point forward outputs. This can be used to help implement cases where different modules have different mixed precision policies. (Default: None)

cast_forward_inputs (bool) – This specifies whether FSDP should cast the forward’s floating-point input tensors to param_dtype or not.

This base class represents the policy of no offloading and is only used as the default value for the offload_policy arg.

This offload policy offloads parameters, gradients, and optimizer states to CPU. Sharded parameters are copied host-to-device before all-gather. The all-gathered parameters are freed according to reshard_after_forward. Sharded gradients are copied device-to-host in backward, and the optimizer step runs on CPU with CPU optimizer states.

pin_memory (bool) – Whether to pin sharded parameter and gradient memory. Pinning memory allows both more efficient H2D/D2H copies and for the copies to overlap with compute. However, the pinned memory cannot be used by other processes. Set this to False if you have insufficient CPU memory. (Default: True)

---

## Distributed communication package - torch.distributed#

**URL:** https://pytorch.org/docs/stable/distributed.html

**Contents:**
- Distributed communication package - torch.distributed#
- Backends#
  - Backends that come with PyTorch#
  - Which backend to use?#
  - Common environment variables#
    - Choosing the network interface to use#
    - Other NCCL environment variables#
- Basics#
- Initialization#
  - TCP initialization#

Created On: Jul 12, 2017 | Last Updated On: Sep 04, 2025

Please refer to PyTorch Distributed Overview for a brief introduction to all features related to distributed training.

torch.distributed supports four built-in backends, each with different capabilities. The table below shows which functions are available for use with a CPU or GPU for each backend. For NCCL, GPU refers to CUDA GPU while for XCCL to XPU GPU.

MPI supports CUDA only if the implementation used to build PyTorch supports it.

PyTorch distributed package supports Linux (stable), MacOS (stable), and Windows (prototype). By default for Linux, the Gloo and NCCL backends are built and included in PyTorch distributed (NCCL only when building with CUDA). MPI is an optional backend that can only be included if you build PyTorch from source. (e.g. building PyTorch on a host that has MPI installed.)

As of PyTorch v1.8, Windows supports all collective communications backend but NCCL, If the init_method argument of init_process_group() points to a file it must adhere to the following schema:

Local file system, init_method="file:///d:/tmp/some_file"

Shared file system, init_method="file://////{machine_name}/{share_folder_name}/some_file"

Same as on Linux platform, you can enable TcpStore by setting environment variables, MASTER_ADDR and MASTER_PORT.

In the past, we were often asked: “which backend should I use?”.

Use the NCCL backend for distributed training with CUDA GPU.

Use the XCCL backend for distributed training with XPU GPU.

Use the Gloo backend for distributed training with CPU.

GPU hosts with InfiniBand interconnect

Use NCCL, since it’s the only backend that currently supports InfiniBand and GPUDirect.

GPU hosts with Ethernet interconnect

Use NCCL, since it currently provides the best distributed GPU training performance, especially for multiprocess single-node or multi-node distributed training. If you encounter any problem with NCCL, use Gloo as the fallback option. (Note that Gloo currently runs slower than NCCL for GPUs.)

CPU hosts with InfiniBand interconnect

If your InfiniBand has enabled IP over IB, use Gloo, otherwise, use MPI instead. We are planning on adding InfiniBand support for Gloo in the upcoming releases.

CPU hosts with Ethernet interconnect

Use Gloo, unless you have specific reasons to use MPI.

By default, both the NCCL and Gloo backends will try to find the right network interface to use. If the automatically detected interface is not correct, you can override it using the following environment variables (applicable to the respective backend):

NCCL_SOCKET_IFNAME, for example export NCCL_SOCKET_IFNAME=eth0

GLOO_SOCKET_IFNAME, for example export GLOO_SOCKET_IFNAME=eth0

If you’re using the Gloo backend, you can specify multiple interfaces by separating them by a comma, like this: export GLOO_SOCKET_IFNAME=eth0,eth1,eth2,eth3. The backend will dispatch operations in a round-robin fashion across these interfaces. It is imperative that all processes specify the same number of interfaces in this variable.

Debugging - in case of NCCL failure, you can set NCCL_DEBUG=INFO to print an explicit warning message as well as basic NCCL initialization information.

You may also use NCCL_DEBUG_SUBSYS to get more details about a specific aspect of NCCL. For example, NCCL_DEBUG_SUBSYS=COLL would print logs of collective calls, which may be helpful when debugging hangs, especially those caused by collective type or message size mismatch. In case of topology detection failure, it would be helpful to set NCCL_DEBUG_SUBSYS=GRAPH to inspect the detailed detection result and save as reference if further help from NCCL team is needed.

Performance tuning - NCCL performs automatic tuning based on its topology detection to save users’ tuning effort. On some socket-based systems, users may still try tuning NCCL_SOCKET_NTHREADS and NCCL_NSOCKS_PERTHREAD to increase socket network bandwidth. These two environment variables have been pre-tuned by NCCL for some cloud providers, such as AWS or GCP.

For a full list of NCCL environment variables, please refer to NVIDIA NCCL’s official documentation

You can tune NCCL communicators even further using torch.distributed.ProcessGroupNCCL.NCCLConfig and torch.distributed.ProcessGroupNCCL.Options. Learn more about them using help (e.g. help(torch.distributed.ProcessGroupNCCL.NCCLConfig)) in the interpreter.

The torch.distributed package provides PyTorch support and communication primitives for multiprocess parallelism across several computation nodes running on one or more machines. The class torch.nn.parallel.DistributedDataParallel() builds on this functionality to provide synchronous distributed training as a wrapper around any PyTorch model. This differs from the kinds of parallelism provided by Multiprocessing package - torch.multiprocessing and torch.nn.DataParallel() in that it supports multiple network-connected machines and in that the user must explicitly launch a separate copy of the main training script for each process.

In the single-machine synchronous case, torch.distributed or the torch.nn.parallel.DistributedDataParallel() wrapper may still have advantages over other approaches to data-parallelism, including torch.nn.DataParallel():

Each process maintains its own optimizer and performs a complete optimization step with each iteration. While this may appear redundant, since the gradients have already been gathered together and averaged across processes and are thus the same for every process, this means that no parameter broadcast step is needed, reducing time spent transferring tensors between nodes.

Each process contains an independent Python interpreter, eliminating the extra interpreter overhead and “GIL-thrashing” that comes from driving several execution threads, model replicas, or GPUs from a single Python process. This is especially important for models that make heavy use of the Python runtime, including models with recurrent layers or many small components.

The package needs to be initialized using the torch.distributed.init_process_group() or torch.distributed.device_mesh.init_device_mesh() function before calling any other methods. Both block until all processes have joined.

Initialization is not thread-safe. Process group creation should be performed from a single thread, to prevent inconsistent ‘UUID’ assignment across ranks, and to prevent races during initialization that can lead to hangs.

Return True if the distributed package is available.

Otherwise, torch.distributed does not expose any other APIs. Currently, torch.distributed is available on Linux, MacOS and Windows. Set USE_DISTRIBUTED=1 to enable it when building PyTorch from source. Currently, the default value is USE_DISTRIBUTED=1 for Linux and Windows, USE_DISTRIBUTED=0 for MacOS.

Initialize the default distributed process group.

This will also initialize the distributed package.

Specify store, rank, and world_size explicitly.

Specify init_method (a URL string) which indicates where/how to discover peers. Optionally specify rank and world_size, or encode all required parameters in the URL and omit them.

If neither is specified, init_method is assumed to be “env://”.

backend (str or Backend, optional) – The backend to use. Depending on build-time configurations, valid values include mpi, gloo, nccl, ucc, xccl or one that is registered by a third-party plugin. Since 2.6, if backend is not provided, c10d will use a backend registered for the device type indicated by the device_id kwarg (if provided). The known default registrations today are: nccl for cuda, gloo for cpu, xccl for xpu. If neither backend nor device_id is provided, c10d will detect the accelerator on the run-time machine and use a backend registered for that detected accelerator (or cpu). This field can be given as a lowercase string (e.g., "gloo"), which can also be accessed via Backend attributes (e.g., Backend.GLOO). If using multiple processes per machine with nccl backend, each process must have exclusive access to every GPU it uses, as sharing GPUs between processes can result in deadlock or NCCL invalid usage. ucc backend is experimental. Default backend for the device can be queried with get_default_backend_for_device().

init_method (str, optional) – URL specifying how to initialize the process group. Default is “env://” if no init_method or store is specified. Mutually exclusive with store.

world_size (int, optional) – Number of processes participating in the job. Required if store is specified.

rank (int, optional) – Rank of the current process (it should be a number between 0 and world_size-1). Required if store is specified.

store (Store, optional) – Key/value store accessible to all workers, used to exchange connection/address information. Mutually exclusive with init_method.

timeout (timedelta, optional) – Timeout for operations executed against the process group. Default value is 10 minutes for NCCL and 30 minutes for other backends. This is the duration after which collectives will be aborted asynchronously and the process will crash. This is done since CUDA execution is async and it is no longer safe to continue executing user code since failed async NCCL operations might result in subsequent CUDA operations running on corrupted data. When TORCH_NCCL_BLOCKING_WAIT is set, the process will block and wait for this timeout.

group_name (str, optional, deprecated) – Group name. This argument is ignored

pg_options (ProcessGroupOptions, optional) – process group options specifying what additional options need to be passed in during the construction of specific process groups. As of now, the only options we support is ProcessGroupNCCL.Options for the nccl backend, is_high_priority_stream can be specified so that the nccl backend can pick up high priority cuda streams when there’re compute kernels waiting. For other available options to config nccl, See https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-t

device_id (torch.device | int, optional) – a single, specific device this process will work on, allowing for backend-specific optimizations. Currently this has two effects, only under NCCL: the communicator is immediately formed (calling ncclCommInit* immediately rather than the normal lazy call) and sub-groups will use ncclCommSplit when possible to avoid unnecessary overhead of group creation. If you want to know NCCL initialization error early, you can also use this field. If an int is provided, the API assumes that the accelerator type at compile time will be used.

To enable backend == Backend.MPI, PyTorch needs to be built from source on a system that supports MPI.

Support for multiple backends is experimental. Currently when no backend is specified, both gloo and nccl backends will be created. The gloo backend will be used for collectives with CPU tensors and the nccl backend will be used for collectives with CUDA tensors. A custom backend can be specified by passing in a string with format “<device_type>:<backend_name>,<device_type>:<backend_name>”, e.g. “cpu:gloo,cuda:custom_backend”.

Initializes a DeviceMesh based on device_type, mesh_shape, and mesh_dim_names parameters.

This creates a DeviceMesh with an n-dimensional array layout, where n is the length of mesh_shape. If mesh_dim_names is provided, each dimension is labeled as mesh_dim_names[i].

init_device_mesh follows SPMD programming model, meaning the same PyTorch Python program runs on all processes/ranks in the cluster. Ensure mesh_shape (the dimensions of the nD array describing device layout) is identical across all ranks. Inconsistent mesh_shape may lead to hanging.

If no process group is found, init_device_mesh will initialize distributed process group/groups required for distributed communications behind the scene.

device_type (str) – The device type of the mesh. Currently supports: “cpu”, “cuda/cuda-like”, “xpu”. Passing in a device type with a GPU index, such as “cuda:0”, is not allowed.

mesh_shape (Tuple[int]) – A tuple defining the dimensions of the multi-dimensional array describing the layout of devices.

mesh_dim_names (Tuple[str], optional) – A tuple of mesh dimension names to assign to each dimension of the multi-dimensional array describing the layout of devices. Its length must match the length of mesh_shape. Each string in mesh_dim_names must be unique.

backend_override (Dict[int | str, tuple[str, Options] | str | Options], optional) – Overrides for some or all of the ProcessGroups that will be created for each mesh dimension. Each key can be either the index of a dimension or its name (if mesh_dim_names is provided). Each value can be a tuple containing the name of the backend and its options, or just one of these two components (in which case the other will be set to its default value).

A DeviceMesh object representing the device layout.

Check if the default process group has been initialized.

Check if the MPI backend is available.

Check if the NCCL backend is available.

Check if the Gloo backend is available.

Check if the XCCL backend is available.

Check whether this process was launched with torch.distributed.elastic (aka torchelastic).

The existence of TORCHELASTIC_RUN_ID environment variable is used as a proxy to determine whether the current process was launched with torchelastic. This is a reasonable proxy since TORCHELASTIC_RUN_ID maps to the rendezvous id which is always a non-null value indicating the job id for peer discovery purposes..

Return the default backend for the given device.

device (Union[str, torch.device]) – The device to get the default backend for.

The default backend for the given device as a lower case string.

Currently three initialization methods are supported:

There are two ways to initialize using TCP, both requiring a network address reachable from all processes and a desired world_size. The first way requires specifying an address that belongs to the rank 0 process. This initialization method requires that all processes have manually specified ranks.

Note that multicast address is not supported anymore in the latest distributed package. group_name is deprecated as well.

Another initialization method makes use of a file system that is shared and visible from all machines in a group, along with a desired world_size. The URL should start with file:// and contain a path to a non-existent file (in an existing directory) on a shared file system. File-system initialization will automatically create that file if it doesn’t exist, but will not delete the file. Therefore, it is your responsibility to make sure that the file is cleaned up before the next init_process_group() call on the same file path/name.

Note that automatic rank assignment is not supported anymore in the latest distributed package and group_name is deprecated as well.

This method assumes that the file system supports locking using fcntl - most local systems and NFS support it.

This method will always create the file and try its best to clean up and remove the file at the end of the program. In other words, each initialization with the file init method will need a brand new empty file in order for the initialization to succeed. If the same file used by the previous initialization (which happens not to get cleaned up) is used again, this is unexpected behavior and can often cause deadlocks and failures. Therefore, even though this method will try its best to clean up the file, if the auto-delete happens to be unsuccessful, it is your responsibility to ensure that the file is removed at the end of the training to prevent the same file to be reused again during the next time. This is especially important if you plan to call init_process_group() multiple times on the same file name. In other words, if the file is not removed/cleaned up and you call init_process_group() again on that file, failures are expected. The rule of thumb here is that, make sure that the file is non-existent or empty every time init_process_group() is called.

This method will read the configuration from environment variables, allowing one to fully customize how the information is obtained. The variables to be set are:

MASTER_PORT - required; has to be a free port on machine with rank 0

MASTER_ADDR - required (except for rank 0); address of rank 0 node

WORLD_SIZE - required; can be set either here, or in a call to init function

RANK - required; can be set either here, or in a call to init function

The machine with rank 0 will be used to set up all connections.

This is the default method, meaning that init_method does not have to be specified (or can be env://).

TORCH_GLOO_LAZY_INIT - establishes connections on demand rather than using a full mesh which can greatly improve initialization time for non all2all operations.

Once torch.distributed.init_process_group() was run, the following functions can be used. To check whether the process group has already been initialized use torch.distributed.is_initialized().

An enum-like class for backends.

Available backends: GLOO, NCCL, UCC, MPI, XCCL, and other registered backends.

The values of this class are lowercase strings, e.g., "gloo". They can be accessed as attributes, e.g., Backend.NCCL.

This class can be directly called to parse the string, e.g., Backend(backend_str) will check if backend_str is valid, and return the parsed lowercase string if so. It also accepts uppercase strings, e.g., Backend("GLOO") returns "gloo".

The entry Backend.UNDEFINED is present but only used as initial value of some fields. Users should neither use it directly nor assume its existence.

Register a new backend with the given name and instantiating function.

This class method is used by 3rd party ProcessGroup extension to register new backends.

name (str) – Backend name of the ProcessGroup extension. It should match the one in init_process_group().

func (function) – Function handler that instantiates the backend. The function should be implemented in the backend extension and takes four arguments, including store, rank, world_size, and timeout.

extended_api (bool, optional) – Whether the backend supports extended argument structure. Default: False. If set to True, the backend will get an instance of c10d::DistributedBackendOptions, and a process group options object as defined by the backend implementation.

device (str or list of str, optional) – device type this backend supports, e.g. “cpu”, “cuda”, etc. If None, assuming both “cpu” and “cuda”

This support of 3rd party backend is experimental and subject to change.

Return the backend of the given process group.

group (ProcessGroup, optional) – The process group to work on. The default is the general main process group. If another specific group is specified, the calling process must be part of group.

The backend of the given process group as a lower case string.

Return the rank of the current process in the provided group, default otherwise.

Rank is a unique identifier assigned to each process within a distributed process group. They are always consecutive integers ranging from 0 to world_size.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

The rank of the process group -1, if not part of the group

Return the number of processes in the current process group.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

The world size of the process group -1, if not part of the group

It is important to clean up resources on exit by calling destroy_process_group().

The simplest pattern to follow is to destroy every process group and backend by calling destroy_process_group() with the default value of None for the group argument, at a point in the training script where communications are no longer needed, usually near the end of main(). The call should be made once per trainer-process, not at the outer process-launcher level.

if destroy_process_group() is not called by all ranks in a pg within the timeout duration, especially when there are multiple process-groups in the application e.g. for N-D parallelism, hangs on exit are possible. This is because the destructor for ProcessGroupNCCL calls ncclCommAbort, which must be called collectively, but the order of calling ProcessGroupNCCL’s destructor if called by python’s GC is not deterministic. Calling destroy_process_group() helps by ensuring ncclCommAbort is called in a consistent order across ranks, and avoids calling ncclCommAbort during ProcessGroupNCCL’s destructor.

destroy_process_group can also be used to destroy individual process groups. One use case could be fault tolerant training, where a process group may be destroyed and then a new one initialized during runtime. In this case, it’s critical to synchronize the trainer processes using some means other than torch.distributed primitives _after_ calling destroy and before subsequently initializing. This behavior is currently unsupported/untested, due to the difficulty of achieving this synchronization, and is considered a known issue. Please file a github issue or RFC if this is a use case that’s blocking you.

By default collectives operate on the default group (also called the world) and require all processes to enter the distributed function call. However, some workloads can benefit from more fine-grained communication. This is where distributed groups come into play. new_group() function can be used to create new groups, with arbitrary subsets of all processes. It returns an opaque group handle that can be given as a group argument to all collectives (collectives are distributed functions to exchange information in certain well-known programming patterns).

Create a new distributed group.

This function requires that all processes in the main group (i.e. all processes that are part of the distributed job) enter this function, even if they are not going to be members of the group. Additionally, groups should be created in the same order in all processes.

Safe concurrent usage: When using multiple process groups with the NCCL backend, the user must ensure a globally consistent execution order of collectives across ranks.

If multiple threads within a process issue collectives, explicit synchronization is necessary to ensure consistent ordering.

When using async variants of torch.distributed communication APIs, a work object is returned and the communication kernel is enqueued on a separate CUDA stream, allowing overlap of communication and computation. Once one or more async ops have been issued on one process group, they must be synchronized with other cuda streams by calling work.wait() before using another process group.

See Using multiple NCCL communicators concurrently <https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/usage/communicators.html#using-multiple-nccl-communicators-concurrently> for more details.

ranks (list[int]) – List of ranks of group members. If None, will be set to all ranks. Default is None.

timeout (timedelta, optional) – see init_process_group for details and default value.

backend (str or Backend, optional) – The backend to use. Depending on build-time configurations, valid values are gloo and nccl. By default uses the same backend as the global group. This field should be given as a lowercase string (e.g., "gloo"), which can also be accessed via Backend attributes (e.g., Backend.GLOO). If None is passed in, the backend corresponding to the default process group will be used. Default is None.

pg_options (ProcessGroupOptions, optional) – process group options specifying what additional options need to be passed in during the construction of specific process groups. i.e. for the nccl backend, is_high_priority_stream can be specified so that process group can pick up high priority cuda streams. For other available options to config nccl, See https://docs.nvidia.com/deeplearning/nccl/user-guide/docs/api/types.html#ncclconfig-tuse_local_synchronization (bool, optional): perform a group-local barrier at the end of the process group creation. This is different in that non-member ranks don’t need to call into API and don’t join the barrier.

group_desc (str, optional) – a string to describe the process group.

device_id (torch.device, optional) – a single, specific device to “bind” this process to, The new_group call will try to initialize a communication backend immediately for the device if this field is given.

A handle of distributed group that can be given to collective calls or GroupMember.NON_GROUP_MEMBER if the rank is not part of ranks.

N.B. use_local_synchronization doesn’t work with MPI.

N.B. While use_local_synchronization=True can be significantly faster with larger clusters and small process groups, care must be taken since it changes cluster behavior as non-member ranks don’t join the group barrier().

N.B. use_local_synchronization=True can lead to deadlocks when each rank creates multiple overlapping process groups. To avoid that, make sure all ranks follow the same global creation order.

Translate a global rank into a group rank.

global_rank must be part of group otherwise this raises RuntimeError.

group (ProcessGroup) – ProcessGroup to find the relative rank.

global_rank (int) – Global rank to query.

Group rank of global_rank relative to group

N.B. calling this function on the default process group returns identity

Translate a group rank into a global rank.

group_rank must be part of group otherwise this raises RuntimeError.

group (ProcessGroup) – ProcessGroup to find the global rank from.

group_rank (int) – Group rank to query.

Global rank of group_rank relative to group

N.B. calling this function on the default process group returns identity

Get all ranks associated with group.

group (Optional[ProcessGroup]) – ProcessGroup to get all ranks from. If None, the default process group will be used.

List of global ranks ordered by group rank.

DeviceMesh is a higher level abstraction that manages process groups (or NCCL communicators). It allows user to easily create inter node and intra node process groups without worrying about how to set up the ranks correctly for different sub process groups, and it helps manage those distributed process group easily. init_device_mesh() function can be used to create new DeviceMesh, with a mesh shape describing the device topology.

DeviceMesh represents a mesh of devices, where layout of devices could be represented as a n-d dimension array, and each value of the n-d dimensional array is the global id of the default process group ranks.

DeviceMesh could be used to setup the N dimensional device connections across the cluster, and manage the ProcessGroups for N dimensional parallelisms. Communications could happen on each dimension of the DeviceMesh separately. DeviceMesh respects the device that user selects already (i.e. if user call torch.cuda.set_device before the DeviceMesh initialization), and will select/set the device for the current process if user does not set the device beforehand. Note that manual device selection should happen BEFORE the DeviceMesh initialization.

DeviceMesh can also be used as a context manager when using together with DTensor APIs.

DeviceMesh follows SPMD programming model, which means the same PyTorch Python program is running on all processes/ranks in the cluster. Therefore, users need to make sure the mesh array (which describes the layout of devices) should be identical across all ranks. Inconsistent mesh will lead to silent hang.

device_type (str) – The device type of the mesh. Currently supports: “cpu”, “cuda/cuda-like”.

mesh (ndarray) – A multi-dimensional array or an integer tensor describing the layout of devices, where the IDs are global IDs of the default process group.

A DeviceMesh object representing the device layout.

The following program runs on each process/rank in an SPMD manner. In this example, we have 2 hosts with 4 GPUs each. A reduction over the first dimension of mesh will reduce across columns (0, 4), .. and (3, 7), a reduction over the second dimension of mesh reduces across rows (0, 1, 2, 3) and (4, 5, 6, 7).

Constructs a DeviceMesh with device_type from an existing ProcessGroup or a list of existing ProcessGroup.

The constructed device mesh has number of dimensions equal to the number of groups passed. For example, if a single process group is passed in, the resulted DeviceMesh is a 1D mesh. If a list of 2 process groups is passed in, the resulted DeviceMesh is a 2D mesh.

If more than one group is passed, then the mesh and mesh_dim_names arguments are required. The order of the process groups passed in determines the topology of the mesh. For example, the first process group will be the 0th dimension of the DeviceMesh. The mesh tensor passed in must have the same number of dimensions as the number of process groups passed in, and the order of the dimensions in the mesh tensor must match the order in the process groups passed in.

group (ProcessGroup or list[ProcessGroup]) – the existing ProcessGroup or a list of existing ProcessGroups.

device_type (str) – The device type of the mesh. Currently supports: “cpu”, “cuda/cuda-like”. Passing in a device type with a GPU index, such as “cuda:0”, is not allowed.

mesh (torch.Tensor or ArrayLike, optional) – A multi-dimensional array or an integer tensor describing the layout of devices, where the IDs are global IDs of the default process group. Default is None.

mesh_dim_names (tuple[str], optional) – A tuple of mesh dimension names to assign to each dimension of the multi-dimensional array describing the layout of devices. Its length must match the length of mesh_shape. Each string in mesh_dim_names must be unique. Default is None.

A DeviceMesh object representing the device layout.

Returns a list of ProcessGroups for all mesh dimensions.

A list of ProcessGroup object.

list[torch.distributed.distributed_c10d.ProcessGroup]

Return the relative indices of this rank relative to all dimensions of the mesh. If this rank is not part of the mesh, return None.

Returns the single ProcessGroup specified by mesh_dim, or, if mesh_dim is not specified and the DeviceMesh is 1-dimensional, returns the only ProcessGroup in the mesh.

mesh_dim (str/python:int, optional) – it can be the name of the mesh dimension or the index

None. (of the mesh dimension. Default is) –

A ProcessGroup object.

Returns the local rank of the given mesh_dim of the DeviceMesh.

mesh_dim (str/python:int, optional) – it can be the name of the mesh dimension or the index

None. (of the mesh dimension. Default is) –

An integer denotes the local rank.

The following program runs on each process/rank in an SPMD manner. In this example, we have 2 hosts with 4 GPUs each. Calling mesh_2d.get_local_rank(mesh_dim=0) on rank 0, 1, 2, 3 would return 0. Calling mesh_2d.get_local_rank(mesh_dim=0) on rank 4, 5, 6, 7 would return 1. Calling mesh_2d.get_local_rank(mesh_dim=1) on rank 0, 4 would return 0. Calling mesh_2d.get_local_rank(mesh_dim=1) on rank 1, 5 would return 1. Calling mesh_2d.get_local_rank(mesh_dim=1) on rank 2, 6 would return 2. Calling mesh_2d.get_local_rank(mesh_dim=1) on rank 3, 7 would return 3.

Returns the current global rank.

Send a tensor synchronously.

tag is not supported with the NCCL backend.

tensor (Tensor) – Tensor to send.

dst (int) – Destination rank on global process group (regardless of group argument). Destination rank should not be the same as the rank of the current process.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

tag (int, optional) – Tag to match send with remote recv

group_dst (int, optional) – Destination rank on group. Invalid to specify both dst and group_dst.

Receives a tensor synchronously.

tag is not supported with the NCCL backend.

tensor (Tensor) – Tensor to fill with received data.

src (int, optional) – Source rank on global process group (regardless of group argument). Will receive from any process if unspecified.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

tag (int, optional) – Tag to match recv with remote send

group_src (int, optional) – Destination rank on group. Invalid to specify both src and group_src.

Sender rank -1, if not part of the group

isend() and irecv() return distributed request objects when used. In general, the type of this object is unspecified as they should never be created manually, but they are guaranteed to support two methods:

is_completed() - returns True if the operation has finished

wait() - will block the process until the operation is finished. is_completed() is guaranteed to return True once it returns.

Send a tensor asynchronously.

Modifying tensor before the request completes causes undefined behavior.

tag is not supported with the NCCL backend.

Unlike send, which is blocking, isend allows src == dst rank, i.e. send to self.

tensor (Tensor) – Tensor to send.

dst (int) – Destination rank on global process group (regardless of group argument)

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

tag (int, optional) – Tag to match send with remote recv

group_dst (int, optional) – Destination rank on group. Invalid to specify both dst and group_dst

A distributed request object. None, if not part of the group

Receives a tensor asynchronously.

tag is not supported with the NCCL backend.

Unlike recv, which is blocking, irecv allows src == dst rank, i.e. recv from self.

tensor (Tensor) – Tensor to fill with received data.

src (int, optional) – Source rank on global process group (regardless of group argument). Will receive from any process if unspecified.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

tag (int, optional) – Tag to match recv with remote send

group_src (int, optional) – Destination rank on group. Invalid to specify both src and group_src.

A distributed request object. None, if not part of the group

Sends picklable objects in object_list synchronously.

Similar to send(), but Python objects can be passed in. Note that all objects in object_list must be picklable in order to be sent.

object_list (List[Any]) – List of input objects to sent. Each object must be picklable. Receiver must provide lists of equal sizes.

dst (int) – Destination rank to send object_list to. Destination rank is based on global process group (regardless of group argument)

group (Optional[ProcessGroup]) – (ProcessGroup, optional): The process group to work on. If None, the default process group will be used. Default is None.

device (torch.device, optional) – If not None, the objects are serialized and converted to tensors which are moved to the device before sending. Default is None.

group_dst (int, optional) – Destination rank on group. Must specify one of dst and group_dst but not both

use_batch (bool, optional) – If True, use batch p2p operations instead of regular send operations. This avoids initializing 2-rank communicators and uses existing entire group communicators. See batch_isend_irecv for usage and assumptions. Default is False.

For NCCL-based process groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

send_object_list() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling send_object_list() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using send() instead.

Receives picklable objects in object_list synchronously.

Similar to recv(), but can receive Python objects.

object_list (List[Any]) – List of objects to receive into. Must provide a list of sizes equal to the size of the list being sent.

src (int, optional) – Source rank from which to recv object_list. Source rank is based on global process group (regardless of group argument) Will receive from any rank if set to None. Default is None.

group (Optional[ProcessGroup]) – (ProcessGroup, optional): The process group to work on. If None, the default process group will be used. Default is None.

device (torch.device, optional) – If not None, receives on this device. Default is None.

group_src (int, optional) – Destination rank on group. Invalid to specify both src and group_src.

use_batch (bool, optional) – If True, use batch p2p operations instead of regular send operations. This avoids initializing 2-rank communicators and uses existing entire group communicators. See batch_isend_irecv for usage and assumptions. Default is False.

Sender rank. -1 if rank is not part of the group. If rank is part of the group, object_list will contain the sent objects from src rank.

For NCCL-based process groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

recv_object_list() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling recv_object_list() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using recv() instead.

Send or Receive a batch of tensors asynchronously and return a list of requests.

Process each of the operations in p2p_op_list and return the corresponding requests. NCCL, Gloo, and UCC backend are currently supported.

p2p_op_list (list[torch.distributed.distributed_c10d.P2POp]) – A list of point-to-point operations(type of each operator is torch.distributed.P2POp). The order of the isend/irecv in the list matters and it needs to match with corresponding isend/irecv on the remote end.

A list of distributed request objects returned by calling the corresponding op in the op_list.

list[torch.distributed.distributed_c10d.Work]

Note that when this API is used with the NCCL PG backend, users must set the current GPU device with torch.cuda.set_device, otherwise it will lead to unexpected hang issues.

In addition, if this API is the first collective call in the group passed to dist.P2POp, all ranks of the group must participate in this API call; otherwise, the behavior is undefined. If this API call is not the first collective call in the group, batched P2P operations involving only a subset of ranks of the group are allowed.

A class to build point-to-point operations for batch_isend_irecv.

This class builds the type of P2P operation, communication buffer, peer rank, Process Group, and tag. Instances of this class will be passed to batch_isend_irecv for point-to-point communications.

op (Callable) – A function to send data to or receive data from a peer process. The type of op is either torch.distributed.isend or torch.distributed.irecv.

tensor (Tensor) – Tensor to send or receive.

peer (int, optional) – Destination or source rank.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

tag (int, optional) – Tag to match send with recv.

group_peer (int, optional) – Destination or source rank.

Every collective operation function supports the following two kinds of operations, depending on the setting of the async_op flag passed into the collective:

Synchronous operation - the default mode, when async_op is set to False. When the function returns, it is guaranteed that the collective operation is performed. In the case of CUDA operations, it is not guaranteed that the CUDA operation is completed, since CUDA operations are asynchronous. For CPU collectives, any further function calls utilizing the output of the collective call will behave as expected. For CUDA collectives, function calls utilizing the output on the same CUDA stream will behave as expected. Users must take care of synchronization under the scenario of running under different streams. For details on CUDA semantics such as stream synchronization, see CUDA Semantics. See the below script to see examples of differences in these semantics for CPU and CUDA operations.

Asynchronous operation - when async_op is set to True. The collective operation function returns a distributed request object. In general, you don’t need to create it manually and it is guaranteed to support two methods:

is_completed() - in the case of CPU collectives, returns True if completed. In the case of CUDA operations, returns True if the operation has been successfully enqueued onto a CUDA stream and the output can be utilized on the default stream without further synchronization.

wait() - in the case of CPU collectives, will block the process until the operation is completed. In the case of CUDA collectives, will block the currently active CUDA stream until the operation is completed (but will not block the CPU).

get_future() - returns torch._C.Future object. Supported for NCCL, also supported for most operations on GLOO and MPI, except for peer to peer operations. Note: as we continue adopting Futures and merging APIs, get_future() call might become redundant.

The following code can serve as a reference regarding semantics for CUDA operations when using distributed collectives. It shows the explicit need to synchronize when using collective outputs on different CUDA streams:

Broadcasts the tensor to the whole group.

tensor must have the same number of elements in all processes participating in the collective.

tensor (Tensor) – Data to be sent if src is the rank of current process, and tensor to be used to save received data otherwise.

src (int) – Source rank on global process group (regardless of group argument).

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

group_src (int) – Source rank on group. Must specify one of group_src and src but not both.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Broadcasts picklable objects in object_list to the whole group.

Similar to broadcast(), but Python objects can be passed in. Note that all objects in object_list must be picklable in order to be broadcasted.

object_list (List[Any]) – List of input objects to broadcast. Each object must be picklable. Only objects on the src rank will be broadcast, but each rank must provide lists of equal sizes.

src (int) – Source rank from which to broadcast object_list. Source rank is based on global process group (regardless of group argument)

group (Optional[ProcessGroup]) – (ProcessGroup, optional): The process group to work on. If None, the default process group will be used. Default is None.

device (torch.device, optional) – If not None, the objects are serialized and converted to tensors which are moved to the device before broadcasting. Default is None.

group_src (int) – Source rank on group. Must not specify one of group_src and src but not both.

None. If rank is part of the group, object_list will contain the broadcasted objects from src rank.

For NCCL-based process groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Note that this API differs slightly from the broadcast() collective since it does not provide an async_op handle and thus will be a blocking call.

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

broadcast_object_list() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling broadcast_object_list() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using broadcast() instead.

Reduces the tensor data across all machines in a way that all get the final result.

After the call tensor is going to be bitwise identical in all processes.

Complex tensors are supported.

tensor (Tensor) – Input and output of the collective. The function operates in-place.

op (optional) – One of the values from torch.distributed.ReduceOp enum. Specifies an operation used for element-wise reductions.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Reduces the tensor data across all machines.

Only the process with rank dst is going to receive the final result.

tensor (Tensor) – Input and output of the collective. The function operates in-place.

dst (int) – Destination rank on global process group (regardless of group argument)

op (optional) – One of the values from torch.distributed.ReduceOp enum. Specifies an operation used for element-wise reductions.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

group_dst (int) – Destination rank on group. Must specify one of group_dst and dst but not both.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Gathers tensors from the whole group in a list.

Complex and uneven sized tensors are supported.

tensor_list (list[Tensor]) – Output list. It should contain correctly-sized tensors to be used for output of the collective. Uneven sized tensors are supported.

tensor (Tensor) – Tensor to be broadcast from current process.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Gather tensors from all ranks and put them in a single output tensor.

This function requires all tensors to be the same size on each process.

output_tensor (Tensor) – Output tensor to accommodate tensor elements from all ranks. It must be correctly sized to have one of the following forms: (i) a concatenation of all the input tensors along the primary dimension; for definition of “concatenation”, see torch.cat(); (ii) a stack of all the input tensors along the primary dimension; for definition of “stack”, see torch.stack(). Examples below may better explain the supported output forms.

input_tensor (Tensor) – Tensor to be gathered from current rank. Different from the all_gather API, the input tensors in this API must have the same size across all ranks.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Gathers picklable objects from the whole group into a list.

Similar to all_gather(), but Python objects can be passed in. Note that the object must be picklable in order to be gathered.

object_list (list[Any]) – Output list. It should be correctly sized as the size of the group for this collective and will contain the output.

obj (Any) – Pickable Python object to be broadcast from current process.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used. Default is None.

None. If the calling rank is part of this group, the output of the collective will be populated into the input object_list. If the calling rank is not part of the group, the passed in object_list will be unmodified.

Note that this API differs slightly from the all_gather() collective since it does not provide an async_op handle and thus will be a blocking call.

For NCCL-based processed groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

all_gather_object() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling all_gather_object() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using all_gather() instead.

Gathers a list of tensors in a single process.

This function requires all tensors to be the same size on each process.

tensor (Tensor) – Input tensor.

gather_list (list[Tensor], optional) – List of appropriately, same-sized tensors to use for gathered data (default is None, must be specified on the destination rank)

dst (int, optional) – Destination rank on global process group (regardless of group argument). (If both dst and group_dst are None, default is global rank 0)

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

group_dst (int, optional) – Destination rank on group. Invalid to specify both dst and group_dst

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Note that all Tensors in gather_list must have the same size.

Gathers picklable objects from the whole group in a single process.

Similar to gather(), but Python objects can be passed in. Note that the object must be picklable in order to be gathered.

obj (Any) – Input object. Must be picklable.

object_gather_list (list[Any]) – Output list. On the dst rank, it should be correctly sized as the size of the group for this collective and will contain the output. Must be None on non-dst ranks. (default is None)

dst (int, optional) – Destination rank on global process group (regardless of group argument). (If both dst and group_dst are None, default is global rank 0)

group (Optional[ProcessGroup]) – (ProcessGroup, optional): The process group to work on. If None, the default process group will be used. Default is None.

group_dst (int, optional) – Destination rank on group. Invalid to specify both dst and group_dst

None. On the dst rank, object_gather_list will contain the output of the collective.

Note that this API differs slightly from the gather collective since it does not provide an async_op handle and thus will be a blocking call.

For NCCL-based processed groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

gather_object() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling gather_object() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using gather() instead.

Scatters a list of tensors to all processes in a group.

Each process will receive exactly one tensor and store its data in the tensor argument.

Complex tensors are supported.

tensor (Tensor) – Output tensor.

scatter_list (list[Tensor]) – List of tensors to scatter (default is None, must be specified on the source rank)

src (int) – Source rank on global process group (regardless of group argument). (If both src and group_src are None, default is global rank 0)

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

group_src (int, optional) – Source rank on group. Invalid to specify both src and group_src

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

Note that all Tensors in scatter_list must have the same size.

Scatters picklable objects in scatter_object_input_list to the whole group.

Similar to scatter(), but Python objects can be passed in. On each rank, the scattered object will be stored as the first element of scatter_object_output_list. Note that all objects in scatter_object_input_list must be picklable in order to be scattered.

scatter_object_output_list (List[Any]) – Non-empty list whose first element will store the object scattered to this rank.

scatter_object_input_list (List[Any], optional) – List of input objects to scatter. Each object must be picklable. Only objects on the src rank will be scattered, and the argument can be None for non-src ranks.

src (int) – Source rank from which to scatter scatter_object_input_list. Source rank is based on global process group (regardless of group argument). (If both src and group_src are None, default is global rank 0)

group (Optional[ProcessGroup]) – (ProcessGroup, optional): The process group to work on. If None, the default process group will be used. Default is None.

group_src (int, optional) – Source rank on group. Invalid to specify both src and group_src

None. If rank is part of the group, scatter_object_output_list will have its first element set to the scattered object for this rank.

Note that this API differs slightly from the scatter collective since it does not provide an async_op handle and thus will be a blocking call.

Object collectives have a number of serious performance and scalability limitations. See Object collectives for details.

scatter_object_list() uses pickle module implicitly, which is known to be insecure. It is possible to construct malicious pickle data which will execute arbitrary code during unpickling. Only call this function with data you trust.

Calling scatter_object_list() with GPU tensors is not well supported and inefficient as it incurs GPU -> CPU transfer since tensors would be pickled. Please consider using scatter() instead.

Reduces, then scatters a list of tensors to all processes in a group.

output (Tensor) – Output tensor.

input_list (list[Tensor]) – List of tensors to reduce and scatter.

op (optional) – One of the values from torch.distributed.ReduceOp enum. Specifies an operation used for element-wise reductions.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group.

Reduces, then scatters a tensor to all ranks in a group.

output (Tensor) – Output tensor. It should have the same size across all ranks.

input (Tensor) – Input tensor to be reduced and scattered. Its size should be output tensor size times the world size. The input tensor can have one of the following shapes: (i) a concatenation of the output tensors along the primary dimension, or (ii) a stack of the output tensors along the primary dimension. For definition of “concatenation”, see torch.cat(). For definition of “stack”, see torch.stack().

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group.

Split input tensor and then scatter the split list to all processes in a group.

Later the received tensors are concatenated from all the processes in the group and returned as a single output tensor.

Complex tensors are supported.

output (Tensor) – Gathered concatenated output tensor.

input (Tensor) – Input tensor to scatter.

output_split_sizes – (list[Int], optional): Output split sizes for dim 0 if specified None or empty, dim 0 of output tensor must divide equally by world_size.

input_split_sizes – (list[Int], optional): Input split sizes for dim 0 if specified None or empty, dim 0 of input tensor must divide equally by world_size.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group.

all_to_all_single is experimental and subject to change.

Scatters list of input tensors to all processes in a group and return gathered list of tensors in output list.

Complex tensors are supported.

output_tensor_list (list[Tensor]) – List of tensors to be gathered one per rank.

input_tensor_list (list[Tensor]) – List of tensors to scatter one per rank.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group.

all_to_all is experimental and subject to change.

Synchronize all processes.

This collective blocks processes until the whole group enters this function, if async_op is False, or if async work handle is called on wait().

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

async_op (bool, optional) – Whether this op should be an async op

device_ids ([int], optional) – List of device/GPU ids. Only one id is expected.

Async work handle, if async_op is set to True. None, if not async_op or if not part of the group

ProcessGroupNCCL now blocks the cpu thread till the completion of the barrier collective.

ProcessGroupNCCL implements barrier as an all_reduce of a 1-element tensor. A device must be chosen for allocating this tensor. The device choice is made by checking in this order (1) the first device passed to device_ids arg of barrier if not None, (2) the device passed to init_process_group if not None, (3) the device that was first used with this process group, if another collective with tensor inputs has been performed, (4) the device index indicated by the global rank mod local device count.

Synchronize processes similar to torch.distributed.barrier, but consider a configurable timeout.

It is able to report ranks that did not pass this barrier within the provided timeout. Specifically, for non-zero ranks, will block until a send/recv is processed from rank 0. Rank 0 will block until all send /recv from other ranks are processed, and will report failures for ranks that failed to respond in time. Note that if one rank does not reach the monitored_barrier (for example due to a hang), all other ranks would fail in monitored_barrier.

This collective will block all processes/ranks in the group, until the whole group exits the function successfully, making it useful for debugging and synchronizing. However, it can have a performance impact and should only be used for debugging or scenarios that require full synchronization points on the host-side. For debugging purposes, this barrier can be inserted before the application’s collective calls to check if any ranks are desynchronized.

Note that this collective is only supported with the GLOO backend.

group (ProcessGroup, optional) – The process group to work on. If None, the default process group will be used.

timeout (datetime.timedelta, optional) – Timeout for monitored_barrier. If None, the default process group timeout will be used.

wait_all_ranks (bool, optional) – Whether to collect all failed ranks or not. By default, this is False and monitored_barrier on rank 0 will throw on the first failed rank it encounters in order to fail fast. By setting wait_all_ranks=True monitored_barrier will collect all failed ranks and throw an error containing information about all failed ranks.

A Work object represents the handle to a pending asynchronous operation in PyTorch’s distributed package. It is returned by non-blocking collective operations, such as dist.all_reduce(tensor, async_op=True).

Blocks the currently active GPU stream on the operation to complete. For GPU based collectives this is equivalent to synchronize. For CPU initiated collectives such as with Gloo this will block the CUDA stream until the operation is complete.

This returns immediately in all cases.

To check whether an operation was successful you should check the Work object result asynchronously.

A torch.futures.Future object which is associated with the completion of the Work. As an example, a future object can be retrieved by fut = process_group.allreduce(tensors).get_future().

Below is an example of a simple allreduce DDP communication hook that uses get_future API to retrieve a Future associated with the completion of allreduce.

get_future API supports NCCL, and partially GLOO and MPI backends (no support for peer-to-peer operations like send/recv) and will return a torch.futures.Future.

In the example above, allreduce work will be done on GPU using NCCL backend, fut.wait() will return after synchronizing the appropriate NCCL streams with PyTorch’s current device streams to ensure we can have asynchronous CUDA execution and it does not wait for the entire operation to complete on GPU. Note that CUDAFuture does not support TORCH_NCCL_BLOCKING_WAIT flag or NCCL’s barrier(). In addition, if a callback function was added by fut.then(), it will wait until WorkNCCL’s NCCL streams synchronize with ProcessGroupNCCL’s dedicated callback stream and invoke the callback inline after running the callback on the callback stream. fut.then() will return another CUDAFuture that holds the return value of the callback and a CUDAEvent that recorded the callback stream.

For CPU work, fut.done() returns true when work has been completed and value() tensors are ready.

For GPU work, fut.done() returns true only whether the operation has been enqueued.

For mixed CPU-GPU work (e.g. sending GPU tensors with GLOO), fut.done() returns true when tensors have arrived on respective nodes, but not yet necessarily synched on respective GPUs (similarly to GPU work).

A torch.futures.Future object of int type which maps to the enum type of WorkResult As an example, a future object can be retrieved by fut = process_group.allreduce(tensor).get_future_result().

users can use fut.wait() to blocking wait for the completion of the work and get the WorkResult by fut.value(). Also, users can use fut.then(call_back_func) to register a callback function to be called when the work is completed, without blocking the current thread.

get_future_result API supports NCCL

In normal cases, users do not need to set the timeout. calling wait() is the same as calling synchronize(): Letting the current stream block on the completion of the NCCL work. However, if timeout is set, it will block the CPU thread until the NCCL work is completed or timed out. If timeout, exception will be thrown.

An enum-like class for available reduction operations: SUM, PRODUCT, MIN, MAX, BAND, BOR, BXOR, and PREMUL_SUM.

BAND, BOR, and BXOR reductions are not available when using the NCCL backend.

AVG divides values by the world size before summing across ranks. AVG is only available with the NCCL backend, and only for NCCL versions 2.10 or later.

PREMUL_SUM multiplies inputs by a given scalar locally before reduction. PREMUL_SUM is only available with the NCCL backend, and only available for NCCL versions 2.11 or later. Users are supposed to use torch.distributed._make_nccl_premul_sum.

Additionally, MAX, MIN and PRODUCT are not supported for complex tensors.

The values of this class can be accessed as attributes, e.g., ReduceOp.SUM. They are used in specifying strategies for reduction collectives, e.g., reduce().

This class does not support __members__ property.

Deprecated enum-like class for reduction operations: SUM, PRODUCT, MIN, and MAX.

ReduceOp is recommended to use instead.

The distributed package comes with a distributed key-value store, which can be used to share information between processes in the group as well as to initialize the distributed package in torch.distributed.init_process_group() (by explicitly creating the store as an alternative to specifying init_method.) There are 3 choices for Key-Value Stores: TCPStore, FileStore, and HashStore.

Base class for all store implementations, such as the 3 provided by PyTorch distributed: (TCPStore, FileStore, and HashStore).

The first call to add for a given key creates a counter associated with key in the store, initialized to amount. Subsequent calls to add with the same key increment the counter by the specified amount. Calling add() with a key that has already been set in the store by set() will result in an exception.

key (str) – The key in the store whose counter will be incremented.

amount (int) – The quantity by which the counter will be incremented.

Append the key-value pair into the store based on the supplied key and value. If key does not exists in the store, it will be created.

key (str) – The key to be appended to the store.

value (str) – The value associated with key to be added to the store.

The call to check whether a given list of keys have value stored in the store. This call immediately returns in normal cases but still suffers from some edge deadlock cases, e.g, calling check after TCPStore has been destroyed. Calling check() with a list of keys that one wants to check whether stored in the store or not.

keys (list[str]) – The keys to query whether stored in the store.

Clones the store and returns a new object that points to the same underlying store. The returned store can be used concurrently with the original object. This is intended to provide a safe way to use a store from multiple threads by cloning one store per thread.

Inserts the key-value pair into the store based on the supplied key and performs comparison between expected_value and desired_value before inserting. desired_value will only be set if expected_value for the key already exists in the store or if expected_value is an empty string.

key (str) – The key to be checked in the store.

expected_value (str) – The value associated with key to be checked before insertion.

desired_value (str) – The value associated with key to be added to the store.

Deletes the key-value pair associated with key from the store. Returns true if the key was successfully deleted, and false if it was not.

The delete_key API is only supported by the TCPStore and HashStore. Using this API with the FileStore will result in an exception.

key (str) – The key to be deleted from the store

True if key was deleted, otherwise False.

Retrieves the value associated with the given key in the store. If key is not present in the store, the function will wait for timeout, which is defined when initializing the store, before throwing an exception.

key (str) – The function will return the value associated with this key.

Value associated with key if key is in the store.

Returns true if the store supports extended operations.

Retrieve all values in keys. If any key in keys is not present in the store, the function will wait for timeout

keys (List[str]) – The keys to be retrieved from the store.

Inserts a list key-value pair into the store based on the supplied keys and values

keys (List[str]) – The keys to insert.

values (List[str]) – The values to insert.

Returns the number of keys set in the store. Note that this number will typically be one greater than the number of keys added by set() and add() since one key is used to coordinate all the workers using the store.

When used with the TCPStore, num_keys returns the number of keys written to the underlying file. If the store is destructed and another store is created with the same file, the original keys will be retained.

The number of keys present in the store.

Returns the length of the specified queue.

If the queue doesn’t exist it returns 0.

See queue_push for more details.

key (str) – The key of the queue to get the length.

Pops a value from the specified queue or waits until timeout if the queue is empty.

See queue_push for more details.

If block is False, a dist.QueueEmptyError will be raised if the queue is empty.

key (str) – The key of the queue to pop from.

block (bool) – Whether to block waiting for the key or immediately return.

Pushes a value into the specified queue.

Using the same key for queues and set/get operations may result in unexpected behavior.

wait/check operations are supported for queues.

wait with queues will only wake one waiting worker rather than all.

key (str) – The key of the queue to push to.

value (str) – The value to push into the queue.

Inserts the key-value pair into the store based on the supplied key and value. If key already exists in the store, it will overwrite the old value with the new supplied value.

key (str) – The key to be added to the store.

value (str) – The value associated with key to be added to the store.

Sets the store’s default timeout. This timeout is used during initialization and in wait() and get().

timeout (timedelta) – timeout to be set in the store.

Gets the timeout of the store.

wait(self: torch._C._distributed_c10d.Store, arg0: collections.abc.Sequence[str]) -> None

Waits for each key in keys to be added to the store. If not all keys are set before the timeout (set during store initialization), then wait will throw an exception.

keys (list) – List of keys on which to wait until they are set in the store.

wait(self: torch._C._distributed_c10d.Store, arg0: collections.abc.Sequence[str], arg1: datetime.timedelta) -> None

Waits for each key in keys to be added to the store, and throws an exception if the keys have not been set by the supplied timeout.

keys (list) – List of keys on which to wait until they are set in the store.

timeout (timedelta) – Time to wait for the keys to be added before throwing an exception.

A TCP-based distributed key-value store implementation. The server store holds the data, while the client stores can connect to the server store over TCP and perform actions such as set() to insert a key-value pair, get() to retrieve a key-value pair, etc. There should always be one server store initialized because the client store(s) will wait for the server to establish a connection.

host_name (str) – The hostname or IP Address the server store should run on.

port (int) – The port on which the server store should listen for incoming requests.

world_size (int, optional) – The total number of store users (number of clients + 1 for the server). Default is None (None indicates a non-fixed number of store users).

is_master (bool, optional) – True when initializing the server store and False for client stores. Default is False.

timeout (timedelta, optional) – Timeout used by the store during initialization and for methods such as get() and wait(). Default is timedelta(seconds=300)

wait_for_workers (bool, optional) – Whether to wait for all the workers to connect with the server store. This is only applicable when world_size is a fixed value. Default is True.

multi_tenant (bool, optional) – If True, all TCPStore instances in the current process with the same host/port will use the same underlying TCPServer. Default is False.

master_listen_fd (int, optional) – If specified, the underlying TCPServer will listen on this file descriptor, which must be a socket already bound to port. To bind an ephemeral port we recommend setting the port to 0 and reading .port. Default is None (meaning the server creates a new socket and attempts to bind it to port).

use_libuv (bool, optional) – If True, use libuv for TCPServer backend. Default is True.

Creates a new TCPStore.

Gets the hostname on which the store listens for requests.

Returns True if it’s using the libuv backend.

Gets the port number on which the store listens for requests.

A thread-safe store implementation based on an underlying hashmap. This store can be used within the same process (for example, by other threads), but cannot be used across processes.

Creates a new HashStore.

A store implementation that uses a file to store the underlying key-value pairs.

file_name (str) – path of the file in which to store the key-value pairs

world_size (int, optional) – The total number of processes using the store. Default is -1 (a negative value indicates a non-fixed number of store users).

Creates a new FileStore.

Gets the path of the file used by FileStore to store key-value pairs.

A wrapper around any of the 3 key-value stores (TCPStore, FileStore, and HashStore) that adds a prefix to each key inserted to the store.

prefix (str) – The prefix string that is prepended to each key before being inserted into the store.

store (torch.distributed.store) – A store object that forms the underlying key-value store.

Creates a new PrefixStore.

Gets the underlying store object that PrefixStore wraps around.

Note that you can use torch.profiler (recommended, only available after 1.8.1) or torch.autograd.profiler to profile collective communication and point-to-point communication APIs mentioned here. All out-of-the-box backends (gloo, nccl, mpi) are supported and collective communication usage will be rendered as expected in profiling output/traces. Profiling your code is the same as any regular torch operator:

Please refer to the profiler documentation for a full overview of profiler features.

The multi-GPU functions (which stand for multiple GPUs per CPU thread) are deprecated. As of today, PyTorch Distributed’s preferred programming model is one device per thread, as exemplified by the APIs in this document. If you are a backend developer and want to support multiple devices per thread, please contact PyTorch Distributed’s maintainers.

Object collectives have a number of serious limitations. Read further to determine if they are safe to use for your use case.

Object collectives are a set of collective-like operations that work on arbitrary Python objects, as long as they can be pickled. There are various collective patterns implemented (e.g. broadcast, all_gather, …) but they each roughly follow this pattern:

convert the input object into a pickle (raw bytes), then shove it into a byte tensor

communicate the size of this byte tensor to peers (first collective operation)

allocate appropriately sized tensor to perform the real collective

communicate the object data (second collective operation)

convert raw data back into Python (unpickle)

Object collectives sometimes have surprising performance or memory characteristics that lead to long runtimes or OOMs, and thus they should be used with caution. Here are some common issues.

Asymmetric pickle/unpickle time - Pickling objects can be slow, depending on the number, type and size of the objects. When the collective has a fan-in (e.g. gather_object), the receiving rank(s) must unpickle N times more objects than the sending rank(s) had to pickle, which can cause other ranks to time out on their next collective.

Inefficient tensor communication - Tensors should be sent via regular collective APIs, not object collective APIs. It is possible to send Tensors via object collective APIs, but they will be serialized and deserialized (including a CPU-sync and device-to-host copy in the case of non-CPU tensors), and in almost every case other than debugging or troubleshooting code, it would be worth the trouble to refactor the code to use non-object collectives instead.

Unexpected tensor devices - If you still want to send tensors via object collectives, there is another aspect specific to cuda (and possibly other accelerators) tensors. If you pickle a tensor that is currently on cuda:3, and then unpickle it, you will get another tensor on cuda:3 regardless of which process you are on, or which CUDA device is the ‘default’ device for that process. With regular tensor collective APIs, ‘output tensors’ will always be on the same, local device, which is generally what you’d expect.

Unpickling a tensor will implicitly activate a CUDA context if it is the first time a GPU is used by the process, which can waste significant amounts of GPU memory. This issue can be avoided by moving tensors to CPU before passing them as inputs to an object collective.

Besides the builtin GLOO/MPI/NCCL backends, PyTorch distributed supports third-party backends through a run-time register mechanism. For references on how to develop a third-party backend through C++ Extension, please refer to Tutorials - Custom C++ and CUDA Extensions and test/cpp_extensions/cpp_c10d_extension.cpp. The capability of third-party backends are decided by their own implementations.

The new backend derives from c10d::ProcessGroup and registers the backend name and the instantiating interface through torch.distributed.Backend.register_backend() when imported.

When manually importing this backend and invoking torch.distributed.init_process_group() with the corresponding backend name, the torch.distributed package runs on the new backend.

The support of third-party backend is experimental and subject to change.

The torch.distributed package also provides a launch utility in torch.distributed.launch. This helper utility can be used to launch multiple processes per node for distributed training.

Module torch.distributed.launch.

torch.distributed.launch is a module that spawns up multiple distributed training processes on each of the training nodes.

This module is going to be deprecated in favor of torchrun.

The utility can be used for single-node distributed training, in which one or more processes per node will be spawned. The utility can be used for either CPU training or GPU training. If the utility is used for GPU training, each distributed process will be operating on a single GPU. This can achieve well-improved single-node training performance. It can also be used in multi-node distributed training, by spawning up multiple processes on each node for well-improved multi-node distributed training performance as well. This will especially be beneficial for systems with multiple Infiniband interfaces that have direct-GPU support, since all of them can be utilized for aggregated communication bandwidth.

In both cases of single-node distributed training or multi-node distributed training, this utility will launch the given number of processes per node (--nproc-per-node). If used for GPU training, this number needs to be less or equal to the number of GPUs on the current system (nproc_per_node), and each process will be operating on a single GPU from GPU 0 to GPU (nproc_per_node - 1).

How to use this module:

Single-Node multi-process distributed training

Multi-Node multi-process distributed training: (e.g. two nodes)

Node 1: (IP: 192.168.1.1, and has a free port: 1234)

To look up what optional arguments this module offers:

1. This utility and multi-process distributed (single-node or multi-node) GPU training currently only achieves the best performance using the NCCL distributed backend. Thus NCCL backend is the recommended backend to use for GPU training.

2. In your training program, you must parse the command-line argument: --local-rank=LOCAL_PROCESS_RANK, which will be provided by this module. If your training program uses GPUs, you should ensure that your code only runs on the GPU device of LOCAL_PROCESS_RANK. This can be done by:

Parsing the local_rank argument

Set your device to local rank using either

Changed in version 2.0.0: The launcher will passes the --local-rank=<rank> argument to your script. From PyTorch 2.0.0 onwards, the dashed --local-rank is preferred over the previously used underscored --local_rank.

For backward compatibility, it may be necessary for users to handle both cases in their argument parsing code. This means including both "--local-rank" and "--local_rank" in the argument parser. If only "--local_rank" is provided, the launcher will trigger an error: “error: unrecognized arguments: –local-rank=<rank>”. For training code that only supports PyTorch 2.0.0+, including "--local-rank" should be sufficient.

3. In your training program, you are supposed to call the following function at the beginning to start the distributed backend. It is strongly recommended that init_method=env://. Other init methods (e.g. tcp://) may work, but env:// is the one that is officially supported by this module.

4. In your training program, you can either use regular distributed functions or use torch.nn.parallel.DistributedDataParallel() module. If your training program uses GPUs for training and you would like to use torch.nn.parallel.DistributedDataParallel() module, here is how to configure it.

Please ensure that device_ids argument is set to be the only GPU device id that your code will be operating on. This is generally the local rank of the process. In other words, the device_ids needs to be [args.local_rank], and output_device needs to be args.local_rank in order to use this utility

5. Another way to pass local_rank to the subprocesses via environment variable LOCAL_RANK. This behavior is enabled when you launch the script with --use-env=True. You must adjust the subprocess example above to replace args.local_rank with os.environ['LOCAL_RANK']; the launcher will not pass --local-rank when you specify this flag.

local_rank is NOT globally unique: it is only unique per process on a machine. Thus, don’t use it to decide if you should, e.g., write to a networked filesystem. See pytorch/pytorch#12042 for an example of how things can go wrong if you don’t do this correctly.

The Multiprocessing package - torch.multiprocessing package also provides a spawn function in torch.multiprocessing.spawn(). This helper function can be used to spawn multiple processes. It works by passing in the function that you want to run and spawns N processes to run it. This can be used for multiprocess distributed training as well.

For references on how to use it, please refer to PyTorch example - ImageNet implementation

Note that this function requires Python 3.4 or higher.

Debugging distributed applications can be challenging due to hard to understand hangs, crashes, or inconsistent behavior across ranks. torch.distributed provides a suite of tools to help debug training applications in a self-serve fashion:

It is extremely convenient to use python’s debugger in a distributed environment, but because it does not work out of the box many people do not use it at all. PyTorch offers a customized wrapper around pdb that streamlines the process.

torch.distributed.breakpoint makes this process easy. Internally, it customizes pdb’s breakpoint behavior in two ways but otherwise behaves as normal pdb.

Attaches the debugger only on one rank (specified by the user).

Ensures all other ranks stop, by using a torch.distributed.barrier() that will release once the debugged rank issues a continue

Reroutes stdin from the child process such that it connects to your terminal.

To use it, simply issue torch.distributed.breakpoint(rank) on all ranks, using the same value for rank in each case.

As of v1.10, torch.distributed.monitored_barrier() exists as an alternative to torch.distributed.barrier() which fails with helpful information about which rank may be faulty when crashing, i.e. not all ranks calling into torch.distributed.monitored_barrier() within the provided timeout. torch.distributed.monitored_barrier() implements a host-side barrier using send/recv communication primitives in a process similar to acknowledgements, allowing rank 0 to report which rank(s) failed to acknowledge the barrier in time. As an example, consider the following function where rank 1 fails to call into torch.distributed.monitored_barrier() (in practice this could be due to an application bug or hang in a previous collective):

The following error message is produced on rank 0, allowing the user to determine which rank(s) may be faulty and investigate further:

With TORCH_CPP_LOG_LEVEL=INFO, the environment variable TORCH_DISTRIBUTED_DEBUG can be used to trigger additional useful logging and collective synchronization checks to ensure all ranks are synchronized appropriately. TORCH_DISTRIBUTED_DEBUG can be set to either OFF (default), INFO, or DETAIL depending on the debugging level required. Please note that the most verbose option, DETAIL may impact the application performance and thus should only be used when debugging issues.

Setting TORCH_DISTRIBUTED_DEBUG=INFO will result in additional debug logging when models trained with torch.nn.parallel.DistributedDataParallel() are initialized, and TORCH_DISTRIBUTED_DEBUG=DETAIL will additionally log runtime performance statistics a select number of iterations. These runtime statistics include data such as forward time, backward time, gradient communication time, etc. As an example, given the following application:

The following logs are rendered at initialization time:

The following logs are rendered during runtime (when TORCH_DISTRIBUTED_DEBUG=DETAIL is set):

In addition, TORCH_DISTRIBUTED_DEBUG=INFO enhances crash logging in torch.nn.parallel.DistributedDataParallel() due to unused parameters in the model. Currently, find_unused_parameters=True must be passed into torch.nn.parallel.DistributedDataParallel() initialization if there are parameters that may be unused in the forward pass, and as of v1.10, all model outputs are required to be used in loss computation as torch.nn.parallel.DistributedDataParallel() does not support unused parameters in the backwards pass. These constraints are challenging especially for larger models, thus when crashing with an error, torch.nn.parallel.DistributedDataParallel() will log the fully qualified name of all parameters that went unused. For example, in the above application, if we modify loss to be instead computed as loss = output[1], then TwoLinLayerNet.a does not receive a gradient in the backwards pass, and thus results in DDP failing. On a crash, the user is passed information about parameters which went unused, which may be challenging to manually find for large models:

Setting TORCH_DISTRIBUTED_DEBUG=DETAIL will trigger additional consistency and synchronization checks on every collective call issued by the user either directly or indirectly (such as DDP allreduce). This is done by creating a wrapper process group that wraps all process groups returned by torch.distributed.init_process_group() and torch.distributed.new_group() APIs. As a result, these APIs will return a wrapper process group that can be used exactly like a regular process group, but performs consistency checks before dispatching the collective to an underlying process group. Currently, these checks include a torch.distributed.monitored_barrier(), which ensures all ranks complete their outstanding collective calls and reports ranks which are stuck. Next, the collective itself is checked for consistency by ensuring all collective functions match and are called with consistent tensor shapes. If this is not the case, a detailed error report is included when the application crashes, rather than a hang or uninformative error message. As an example, consider the following function which has mismatched input shapes into torch.distributed.all_reduce():

With the NCCL backend, such an application would likely result in a hang which can be challenging to root-cause in nontrivial scenarios. If the user enables TORCH_DISTRIBUTED_DEBUG=DETAIL and reruns the application, the following error message reveals the root cause:

For fine-grained control of the debug level during runtime the functions torch.distributed.set_debug_level(), torch.distributed.set_debug_level_from_env(), and torch.distributed.get_debug_level() can also be used.

In addition, TORCH_DISTRIBUTED_DEBUG=DETAIL can be used in conjunction with TORCH_SHOW_CPP_STACKTRACES=1 to log the entire callstack when a collective desynchronization is detected. These collective desynchronization checks will work for all applications that use c10d collective calls backed by process groups created with the torch.distributed.init_process_group() and torch.distributed.new_group() APIs.

In addition to explicit debugging support via torch.distributed.monitored_barrier() and TORCH_DISTRIBUTED_DEBUG, the underlying C++ library of torch.distributed also outputs log messages at various levels. These messages can be helpful to understand the execution state of a distributed training job and to troubleshoot problems such as network connection failures. The following matrix shows how the log level can be adjusted via the combination of TORCH_CPP_LOG_LEVEL and TORCH_DISTRIBUTED_DEBUG environment variables.

TORCH_DISTRIBUTED_DEBUG

Distributed components raise custom Exception types derived from RuntimeError:

torch.distributed.DistError: This is the base type of all distributed exceptions.

torch.distributed.DistBackendError: This exception is thrown when a backend-specific error occurs. For example, if the NCCL backend is used and the user attempts to use a GPU that is not available to the NCCL library.

torch.distributed.DistNetworkError: This exception is thrown when networking libraries encounter errors (ex: Connection reset by peer)

torch.distributed.DistStoreError: This exception is thrown when the Store encounters an error (ex: TCPStore timeout)

Exception raised when an error occurs in the distributed library

Exception raised when a backend error occurs in distributed

Exception raised when a network error occurs in distributed

Exception raised when an error occurs in the distributed store

If you are running single node training, it may be convenient to interactively breakpoint your script. We offer a way to conveniently breakpoint a single rank:

Set a breakpoint, but only on a single rank. All other ranks will wait for you to be done with the breakpoint before continuing.

rank (int) – Which rank to break on. Default: 0

skip (int) – Skip the first skip calls to this breakpoint. Default: 0.

---

## DistributedDataParallel#

**URL:** https://pytorch.org/docs/stable/generated/torch.nn.parallel.DistributedDataParallel.html

**Contents:**
- DistributedDataParallel#

Implement distributed data parallelism based on torch.distributed at module level.

This container provides data parallelism by synchronizing gradients across each model replica. The devices to synchronize across are specified by the input process_group, which is the entire world by default. Note that DistributedDataParallel does not chunk or otherwise shard the input across participating GPUs; the user is responsible for defining how to do so, for example through the use of a DistributedSampler.

See also: Basics and Use nn.parallel.DistributedDataParallel instead of multiprocessing or nn.DataParallel. The same constraints on input as in torch.nn.DataParallel apply.

Creation of this class requires that torch.distributed to be already initialized, by calling torch.distributed.init_process_group().

DistributedDataParallel is proven to be significantly faster than torch.nn.DataParallel for single-node multi-GPU data parallel training.

To use DistributedDataParallel on a host with N GPUs, you should spawn up N processes, ensuring that each process exclusively works on a single GPU from 0 to N-1. This can be done by either setting CUDA_VISIBLE_DEVICES for every process or by calling the following API for GPUs,

or calling the unified API for accelerator,

where i is from 0 to N-1. In each process, you should refer the following to construct this module:

Or you can use the latest API for initialization:

In order to spawn up multiple processes per node, you can use either torch.distributed.launch or torch.multiprocessing.spawn.

Please refer to PyTorch Distributed Overview for a brief introduction to all features related to distributed training.

DistributedDataParallel can be used in conjunction with torch.distributed.optim.ZeroRedundancyOptimizer to reduce per-rank optimizer states memory footprint. Please refer to ZeroRedundancyOptimizer recipe for more details.

nccl backend is currently the fastest and highly recommended backend when using GPUs. This applies to both single-node and multi-node distributed training.

This module also supports mixed-precision distributed training. This means that your model can have different types of parameters such as mixed types of fp16 and fp32, the gradient reduction on these mixed types of parameters will just work fine.

If you use torch.save on one process to checkpoint the module, and torch.load on some other processes to recover it, make sure that map_location is configured properly for every process. Without map_location, torch.load would recover the module to devices where the module was saved from.

When a model is trained on M nodes with batch=N, the gradient will be M times smaller when compared to the same model trained on a single node with batch=M*N if the loss is summed (NOT averaged as usual) across instances in a batch (because the gradients between different nodes are averaged). You should take this into consideration when you want to obtain a mathematically equivalent training process compared to the local training counterpart. But in most cases, you can just treat a DistributedDataParallel wrapped model, a DataParallel wrapped model and an ordinary model on a single GPU as the same (E.g. using the same learning rate for equivalent batch size).

Parameters are never broadcast between processes. The module performs an all-reduce step on gradients and assumes that they will be modified by the optimizer in all processes in the same way. Buffers (e.g. BatchNorm stats) are broadcast from the module in process of rank 0, to all other replicas in the system in every iteration.

If you are using DistributedDataParallel in conjunction with the Distributed RPC Framework, you should always use torch.distributed.autograd.backward() to compute gradients and torch.distributed.optim.DistributedOptimizer for optimizing parameters.

DistributedDataParallel currently offers limited support for gradient checkpointing with torch.utils.checkpoint(). If the checkpoint is done with use_reentrant=False (recommended), DDP will work as expected without any limitations. If, however, the checkpoint is done with use_reentrant=True (the default), DDP will work as expected when there are no unused parameters in the model and each layer is checkpointed at most once (make sure you are not passing find_unused_parameters=True to DDP). We currently do not support the case where a layer is checkpointed multiple times, or when there unused parameters in the checkpointed model.

To let a non-DDP model load a state dict from a DDP model, consume_prefix_in_state_dict_if_present() needs to be applied to strip the prefix “module.” in the DDP state dict before loading.

Constructor, forward method, and differentiation of the output (or a function of the output of this module) are distributed synchronization points. Take that into account in case different processes might be executing different code.

This module assumes all parameters are registered in the model by the time it is created. No parameters should be added nor removed later. Same applies to buffers.

This module assumes all parameters are registered in the model of each distributed processes are in the same order. The module itself will conduct gradient allreduce following the reverse order of the registered parameters of the model. In other words, it is users’ responsibility to ensure that each distributed process has the exact same model and thus the exact same parameter registration order.

This module allows parameters with non-rowmajor-contiguous strides. For example, your model may contain some parameters whose torch.memory_format is torch.contiguous_format and others whose format is torch.channels_last. However, corresponding parameters in different processes must have the same strides.

This module doesn’t work with torch.autograd.grad() (i.e. it will only work if gradients are to be accumulated in .grad attributes of parameters).

If you plan on using this module with a nccl backend or a gloo backend (that uses Infiniband), together with a DataLoader that uses multiple workers, please change the multiprocessing start method to forkserver (Python 3 only) or spawn. Unfortunately Gloo (that uses Infiniband) and NCCL2 are not fork safe, and you will likely experience deadlocks if you don’t change this setting.

You should never try to change your model’s parameters after wrapping up your model with DistributedDataParallel. Because, when wrapping up your model with DistributedDataParallel, the constructor of DistributedDataParallel will register the additional gradient reduction functions on all the parameters of the model itself at the time of construction. If you change the model’s parameters afterwards, gradient reduction functions no longer match the correct set of parameters.

Using DistributedDataParallel in conjunction with the Distributed RPC Framework is experimental and subject to change.

module (Module) – module to be parallelized

device_ids (list of int or torch.device) – CUDA devices. 1) For single-device modules, device_ids can contain exactly one device id, which represents the only CUDA device where the input module corresponding to this process resides. Alternatively, device_ids can also be None. 2) For multi-device modules and CPU modules, device_ids must be None. When device_ids is None for both cases, both the input data for the forward pass and the actual module must be placed on the correct device. (default: None)

CUDA devices. 1) For single-device modules, device_ids can contain exactly one device id, which represents the only CUDA device where the input module corresponding to this process resides. Alternatively, device_ids can also be None. 2) For multi-device modules and CPU modules, device_ids must be None.

When device_ids is None for both cases, both the input data for the forward pass and the actual module must be placed on the correct device. (default: None)

output_device (int or torch.device) – Device location of output for single-device CUDA modules. For multi-device modules and CPU modules, it must be None, and the module itself dictates the output location. (default: device_ids[0] for single-device modules)

broadcast_buffers (bool) – Flag that enables syncing (broadcasting) buffers of the module at beginning of the forward function. (default: True)

init_sync (bool) – Whether to sync during initialization to verify param shapes and broadcast parameters and buffers. WARNING: if this is set to False the user is required to ensure themselves that the weights are the same on all ranks. (default: True)

process_group – The process group to be used for distributed data all-reduction. If None, the default process group, which is created by torch.distributed.init_process_group(), will be used. (default: None)

bucket_cap_mb – DistributedDataParallel will bucket parameters into multiple buckets so that gradient reduction of each bucket can potentially overlap with backward computation. bucket_cap_mb controls the bucket size in MebiBytes (MiB). If None, a default size of 25 MiB will be used. (default: None)

find_unused_parameters (bool) – Traverse the autograd graph from all tensors contained in the return value of the wrapped module’s forward function. Parameters that don’t receive gradients as part of this graph are preemptively marked as being ready to be reduced. In addition, parameters that may have been used in the wrapped module’s forward function but were not part of loss computation and thus would also not receive gradients are preemptively marked as ready to be reduced. (default: False)

check_reduction – This argument is deprecated.

gradient_as_bucket_view (bool) – When set to True, gradients will be views pointing to different offsets of allreduce communication buckets. This can reduce peak memory usage, where the saved memory size will be equal to the total gradients size. Moreover, it avoids the overhead of copying between gradients and allreduce communication buckets. When gradients are views, detach_() cannot be called on the gradients. If hitting such errors, please fix it by referring to the zero_grad() function in torch/optim/optimizer.py as a solution. Note that gradients will be views after first iteration, so the peak memory saving should be checked after first iteration.

static_graph (bool) – When set to True, DDP knows the trained graph is static. Static graph means 1) The set of used and unused parameters will not change during the whole training loop; in this case, it does not matter whether users set find_unused_parameters = True or not. 2) How the graph is trained will not change during the whole training loop (meaning there is no control flow depending on iterations). When static_graph is set to be True, DDP will support cases that can not be supported in the past: 1) Reentrant backwards. 2) Activation checkpointing multiple times. 3) Activation checkpointing when model has unused parameters. 4) There are model parameters that are outside of forward function. 5) Potentially improve performance when there are unused parameters, as DDP will not search graph in each iteration to detect unused parameters when static_graph is set to be True. To check whether you can set static_graph to be True, one way is to check ddp logging data at the end of your previous model training, if ddp_logging_data.get("can_set_static_graph") == True, mostly you can set static_graph = True as well. Example::>>> model_DDP = torch.nn.parallel.DistributedDataParallel(model) >>> # Training loop >>> ... >>> ddp_logging_data = model_DDP._get_ddp_logging_data() >>> static_graph = ddp_logging_data.get("can_set_static_graph")

When set to True, DDP knows the trained graph is static. Static graph means 1) The set of used and unused parameters will not change during the whole training loop; in this case, it does not matter whether users set find_unused_parameters = True or not. 2) How the graph is trained will not change during the whole training loop (meaning there is no control flow depending on iterations). When static_graph is set to be True, DDP will support cases that can not be supported in the past: 1) Reentrant backwards. 2) Activation checkpointing multiple times. 3) Activation checkpointing when model has unused parameters. 4) There are model parameters that are outside of forward function. 5) Potentially improve performance when there are unused parameters, as DDP will not search graph in each iteration to detect unused parameters when static_graph is set to be True. To check whether you can set static_graph to be True, one way is to check ddp logging data at the end of your previous model training, if ddp_logging_data.get("can_set_static_graph") == True, mostly you can set static_graph = True as well.

delay_all_reduce_named_params (list of tuple of str and torch.nn.Parameter) – a list of named parameters whose all reduce will be delayed when the gradient of the parameter specified in param_to_hook_all_reduce is ready. Other arguments of DDP do not apply to named params specified in this argument as these named params will be ignored by DDP reducer.

param_to_hook_all_reduce (torch.nn.Parameter) – a parameter to hook delayed all reduce of parameters specified in delay_all_reduce_named_params.

skip_all_reduce_unused_params – When set to True, DDP will skip reducing unused parameters. This requires that unused parameters remain the same across all ranks throughout the entire training process. If this condition is not met, it may cause desynchronization and result in training hang.

module (Module) – the module to be parallelized.

Context manager for training with uneven inputs across processes in DDP.

This context manager will keep track of already-joined DDP processes, and “shadow” the forward and backward passes by inserting collective communication operations to match with the ones created by non-joined DDP processes. This will ensure each collective call has a corresponding call by already-joined DDP processes, preventing hangs or errors that would otherwise happen when training with uneven inputs across processes. Alternatively, if the flag throw_on_early_termination is specified to be True, all trainers will throw an error once one rank runs out of inputs, allowing these errors to be caught and handled according to application logic.

Once all DDP processes have joined, the context manager will broadcast the model corresponding to the last joined process to all processes to ensure the model is the same across all processes (which is guaranteed by DDP).

To use this to enable training with uneven inputs across processes, simply wrap this context manager around your training loop. No further modifications to the model or data loading is required.

If the model or training loop this context manager is wrapped around has additional distributed collective operations, such as SyncBatchNorm in the model’s forward pass, then the flag throw_on_early_termination must be enabled. This is because this context manager is not aware of non-DDP collective communication. This flag will cause all ranks to throw when any one rank exhausts inputs, allowing these errors to be caught and recovered from across all ranks.

divide_by_initial_world_size (bool) – If True, will divide gradients by the initial world_size DDP training was launched with. If False, will compute the effective world size (number of ranks that have not depleted their inputs yet) and divide gradients by that during allreduce. Set divide_by_initial_world_size=True to ensure every input sample including the uneven inputs have equal weight in terms of how much they contribute to the global gradient. This is achieved by always dividing the gradient by the initial world_size even when we encounter uneven inputs. If you set this to False, we divide the gradient by the remaining number of nodes. This ensures parity with training on a smaller world_size although it also means the uneven inputs would contribute more towards the global gradient. Typically, you would want to set this to True for cases where the last few inputs of your training job are uneven. In extreme cases, where there is a large discrepancy in the number of inputs, setting this to False might provide better results.

enable (bool) – Whether to enable uneven input detection or not. Pass in enable=False to disable in cases where you know that inputs are even across participating processes. Default is True.

throw_on_early_termination (bool) – Whether to throw an error or continue training when at least one rank has exhausted inputs. If True, will throw upon the first rank reaching end of data. If False, will continue training with a smaller effective world size until all ranks are joined. Note that if this flag is specified, then the flag divide_by_initial_world_size would be ignored. Default is False.

DDP join hook enables training on uneven inputs by mirroring communications in forward and backward passes.

kwargs (dict) – a dict containing any keyword arguments to modify the behavior of the join hook at run time; all Joinable instances sharing the same join context manager are forwarded the same value for kwargs.

If True, then gradients are divided by the initial world size that DDP was launched with. If False, then gradients are divided by the effective world size (i.e. the number of non-joined processes), meaning that the uneven inputs contribute more toward the global gradient. Typically, this should be set to True if the degree of unevenness is small but can be set to False in extreme cases for possibly better results. Default is True.

Context manager to disable gradient synchronizations across DDP processes.

Within this context, gradients will be accumulated on module variables, which will later be synchronized in the first forward-backward pass exiting the context.

The forward pass should be included inside the context manager, or else gradients will still be synchronized.

Register communication hook for user-defined DDP aggregation of gradients across multiple workers.

This hook would be very useful for researchers to try out new ideas. For example, this hook can be used to implement several algorithms like GossipGrad and gradient compression which involve different communication strategies for parameter syncs while running Distributed DataParallel training.

state (object) – Passed to the hook to maintain any state information during the training process. Examples include error feedback in gradient compression, peers to communicate with next in GossipGrad, etc. It is locally stored by each worker and shared by all the gradient tensors on the worker.

Passed to the hook to maintain any state information during the training process. Examples include error feedback in gradient compression, peers to communicate with next in GossipGrad, etc.

It is locally stored by each worker and shared by all the gradient tensors on the worker.

hook (Callable) – Callable with the following signature: hook(state: object, bucket: dist.GradBucket) -> torch.futures.Future[torch.Tensor]: This function is called once the bucket is ready. The hook can perform whatever processing is needed and return a Future indicating completion of any async work (ex: allreduce). If the hook doesn’t perform any communication, it still must return a completed Future. The Future should hold the new value of grad bucket’s tensors. Once a bucket is ready, c10d reducer would call this hook and use the tensors returned by the Future and copy grads to individual parameters. Note that the future’s return type must be a single tensor. We also provide an API called get_future to retrieve a Future associated with the completion of c10d.ProcessGroup.Work. get_future is currently supported for NCCL and also supported for most operations on GLOO and MPI, except for peer to peer operations (send/recv).

Callable with the following signature: hook(state: object, bucket: dist.GradBucket) -> torch.futures.Future[torch.Tensor]:

This function is called once the bucket is ready. The hook can perform whatever processing is needed and return a Future indicating completion of any async work (ex: allreduce). If the hook doesn’t perform any communication, it still must return a completed Future. The Future should hold the new value of grad bucket’s tensors. Once a bucket is ready, c10d reducer would call this hook and use the tensors returned by the Future and copy grads to individual parameters. Note that the future’s return type must be a single tensor.

We also provide an API called get_future to retrieve a Future associated with the completion of c10d.ProcessGroup.Work. get_future is currently supported for NCCL and also supported for most operations on GLOO and MPI, except for peer to peer operations (send/recv).

Grad bucket’s tensors will not be predivided by world_size. User is responsible to divide by the world_size in case of operations like allreduce.

DDP communication hook can only be registered once and should be registered before calling backward.

The Future object that hook returns should contain a single tensor that has the same shape with the tensors inside grad bucket.

get_future API supports NCCL, and partially GLOO and MPI backends (no support for peer-to-peer operations like send/recv) and will return a torch.futures.Future.

Below is an example of a noop hook that returns the same tensor.

Below is an example of a Parallel SGD algorithm where gradients are encoded before allreduce, and then decoded after allreduce.

---

## DDP Communication Hooks#

**URL:** https://pytorch.org/docs/stable/ddp_comm_hooks.html

**Contents:**
- DDP Communication Hooks#
- How to Use a Communication Hook?#
- What Does a Communication Hook Operate On?#
- Default Communication Hooks#
- PowerSGD Communication Hook#
  - PowerSGD State#
  - PowerSGD Hooks#
- Debugging Communication Hooks#
- Checkpointing of Communication Hooks#
- Acknowledgements#

Created On: Jun 06, 2025 | Last Updated On: Jun 06, 2025

DDP communication hook is a generic interface to control how to communicate gradients across workers by overriding the vanilla allreduce in DistributedDataParallel. A few built-in communication hooks are provided, and users can easily apply any of these hooks to optimize communication. Besides, the hook interface can also support user-defined communication strategies for more advanced use cases.

To use a communication hook, the user just needs to let the DDP model register the hook before the training loop as below.

torch.nn.parallel.DistributedDataParallel.register_comm_hook()

A communication hook provides a flexible way to allreduce gradients. Therefore, it mainly operates on the gradients on each replica before allreduce, which are bucketized to increase the overlap between communication and computation. Particularly, torch.distributed.GradBucket represents a bucket of gradient tensors to be allreduced.

This class mainly passes a flattened gradient tensor (returned by buffer()) to DDP communication hook. This tensor can be further decomposed into a list of per-parameter tensors within this bucket (returned by get_per_parameter_tensors()) to apply layer-wise operations.

Since the buckets are rebuilt after the first iteration, should not rely on the indices at the beginning of training.

The index of a bucket that stores gradients of a few contiguous layers. All the gradients are bucketized.

A flattened 1D torch.Tensor buffer, which can be further decomposed into a list of per-parameter tensors within this bucket.

A list of torch.Tensor. Each tensor in the list corresponds to a gradient.

Whether this bucket is the last bucket to allreduce in an iteration. This also means that this bucket corresponds to the first few layers in the forward pass.

Replaces the tensor in the bucket with the input tensor buffer.

A list of torch.Tensor. Each tensor in the list corresponds to a model parameter.

Default communication hooks are simple stateless hooks, so the input state in register_comm_hook is either a process group or None. The input bucket is a torch.distributed.GradBucket object.

Call allreduce using GradBucket tensors.

Once gradient tensors are aggregated across all workers, its then callback takes the mean and returns the result.

If user registers this DDP communication hook, DDP results is expected to be same as the case where no hook was registered. Hence, this won’t change behavior of DDP and user can use this as a reference or modify this hook to log useful information or any other purposes while unaffecting DDP behavior.

Compress by casting GradBucket to torch.float16 divided by process group size.

This DDP communication hook implements a simple gradient compression approach that casts GradBucket tensor to half-precision floating-point format (torch.float16) and then divides it by the process group size. It allreduces those float16 gradient tensors. Once compressed gradient tensors are allreduced, the chained callback decompress casts it back to the input data type (such as float32).

Warning: This API is experimental, and it requires NCCL version later than 2.9.6.

This DDP communication hook implements a simple gradient compression approach that casts GradBucket tensor to half-precision Brain floating point format (torch.bfloat16) and then divides it by the process group size. It allreduces those bfloat16 gradient tensors. Once compressed gradient tensors are allreduced, the chained callback decompress casts it back to the input data type (such as float32).

Additionally, a communication hook wrapper is provided to support fp16_compress_hook() or bf16_compress_hook() as a wrapper, which can be combined with other communication hooks.

Cast input tensor to torch.float16, cast result of hook back to input dtype.

This wrapper casts the input gradient tensor of a given DDP communication hook to half-precision floating point format (torch.float16), and casts the resulting tensor of the given hook back to the input data type, such as float32. Therefore, fp16_compress_hook is equivalent to fp16_compress_wrapper(allreduce_hook).

Callable[[Any, GradBucket], Future[Tensor]]

Warning: This API is experimental, and it requires NCCL version later than 2.9.6.

This wrapper casts the input gradient tensor of a given DDP communication hook to half-precision Brain floating point format (torch.bfloat16), and casts the resulting tensor of the given hook back to the input data type, such as float32.

Therefore, bf16_compress_hook is equivalent to bf16_compress_wrapper(allreduce_hook).

Callable[[Any, GradBucket], Future[Tensor]]

PowerSGD (Vogels et al., NeurIPS 2019) is a gradient compression algorithm, which can provide very high compression rates and accelerate bandwidth-bound distributed training. This algorithm needs to maintain both some hyperparameters and the internal state. Therefore, PowerSGD communication hook is a stateful hook, and the user needs to provide a state object defined as below.

Store both the algorithm’s hyperparameters and internal state for all gradients during training.

Particularly, matrix_approximation_rank and start_powerSGD_iter are the main hyperparameters that should be tuned by the user. For performance, we suggest to keep binary hyperparameters use_error_feedback and warm_start on.

matrix_approximation_rank controls the size of compressed low-rank tensors, which determines the compression rate. The lower the rank, the stronger the compression.

1.1. If matrix_approximation_rank is too low, the full model quality will need more training steps to reach or will never reach and yield loss in accuracy.

1.2. The increase of matrix_approximation_rank can substantially increase the computation costs of the compression, and the accuracy may not be further improved beyond a certain matrix_approximation_rank threshold.

To tune matrix_approximation_rank, we suggest to start from 1 and increase by factors of 2 (like an exponential grid search, 1, 2, 4, …), until a satisfactory accuracy is reached. Typically only a small value 1-4 is used. For some NLP tasks (as shown in Appendix D of the original paper), this value has been increased to 32.

start_powerSGD_iter defers PowerSGD compression until step start_powerSGD_iter, and vanilla allreduce runs prior to step start_powerSGD_iter. This hybrid scheme of vanilla allreduce + PowerSGD can effectively improve the accuracy, even a relatively small matrix_approximation_rank is used. This is because that, the beginning of training phase is usually very sensitive to inaccurate gradients, and compressing gradients too early may make the training quickly take a suboptimal trajectory, which can result in an irrecoverable impact on the accuracy.

To tune start_powerSGD_iter, we suggest to start with 10% of total training steps, and increase it until a satisfactory accuracy is reached. If there is a warm-up stage in the training, start_powerSGD_iter typically should be no less than the number of warm-up steps.

min_compression_rate is the minimum compression rate required when a layer is compressed. Due to the computation overheads incurred by the compression, a tensor is worth compressing only if there can be sufficient saving in bandwidth, where (num_rows + num_cols) * matrix_approximation_rank * min_compression_rate < num_rows * num_cols. If the specified compression rate threshold cannot be satisfied, the tensor will be directly allreduced without compression.

Compression statistics are logged every compression_stats_logging_frequency iterations once PowerSGD compression starts.

orthogonalization_epsilon can be a very small value (e.g., 1e-8) added to every normalized matrix column in orthogonalization step, to prevent div-by-zero error if any column has all 0s. If this can already be prevented (e.g., by batch normalization), an epsilon of 0 is recommended for accuracy.

batch_tensors_with_same_shape controls whether to compress and decompress tensors with same shape in a batched operation to achieve higher parallelism. Note that you should also increase the bucket size (i.e., bucket_cap_mb arg in DDP constructor) to make more same-shaped tensors appear in the same bucket, however this may reduce the overlap between computation and communication, and increase the memory footprint due to stacking the tensors of the same shape. Set to True if the compression / decompression computation is a bottleneck.

If error feedback or warm-up is enabled, the minimum value of start_powerSGD_iter allowed in DDP is 2. This is because there is another internal optimization that rebuilds buckets at iteration 1 in DDP, and this can conflict with any tensor memorized before the rebuild process.

PowerSGD typically requires extra memory of the same size as the model’s gradients to enable error feedback, which can compensate for biased compressed communication and improve accuracy.

PowerSGD hooks may conflict with Apex automatic mixed precision package. Please use PyTorch native automatic mixed precision package instead.

Implement PowerSGD algorithm.

This DDP communication hook implements PowerSGD gradient compression algorithm described in the paper. Once gradient tensors are aggregated across all workers, this hook applies compression as follows:

Views the input flattened 1D gradient tensor as a list of per-parameter tensors, and divides all the tensors into two groups:

1.1 The tensors that should be compressed before allreduce, because the compression can give enough saving in bandwidth.

1.2 Rest of the tensors will be directly allreduced without compression, including all the vector tensors (for biases).

Handles uncompressed tensors:

2.1. Allocate contiguous memory for those uncompressed tensors, and allreduces all the uncompressed tensors as a batch, without compression;

2.2. Copies the individual uncompressed tensors from the contiguous memory back to the input tensor.

Handles the tensors that should be compressed by PowerSGD compression:

3.1. For each tensor M, creates two low-rank tensors P and Q for decomposing M, such that M = PQ^T, where Q is initialized from a standard normal distribution and orthogonalized;

3.2. Computes each P in Ps, which is equal to MQ;

3.3. Allreduces Ps as a batch;

3.4. Orthogonalizes each P in Ps;

3.5. Computes each Q in Qs, which is approximately equal to M^TP;

3.6. Allreduces Qs as a batch;

3.7. Computes each M among all the compressed tensors, which is approximately equal to PQ^T.

Note that this communication hook enforces vanilla allreduce for the first state.start_powerSGD_iter iterations. This not only gives the user more control over the tradeoff between speedup and accuracy, but also helps abstract away some complexity of the internal optimization of DDP for future communication hook developers.

state (PowerSGDState) – State information to configure the compression rate and support error feedback, warm start, etc. To tune the compression configs, mainly need to tune matrix_approximation_rank, start_powerSGD_iter and min_compression_rate.

bucket (dist.GradBucket) – Bucket that stores a 1D flattened gradient tensor that batches multiple per-variable tensors. Note that since DDP comm hook only supports single process single device mode, only exactly one tensor is stored in this bucket.

Future handler of the communication, which updates the gradients in place.

Implement simplified PowerSGD algorithm.

This DDP communication hook implements a simplified PowerSGD gradient compression algorithm described in the paper. This variant does not compress the gradients layer by layer, but instead compresses the flattened input tensor that batches all the gradients. Therefore, it is faster than powerSGD_hook(), but usually results in a much lower accuracy, unless matrix_approximation_rank is 1.

Increasing matrix_approximation_rank here may not necessarily increase the accuracy, because batching per-parameter tensors without column/row alignment can destroy low-rank structure. Therefore, the user should always consider powerSGD_hook() first, and only consider this variant when a satisfactory accuracy can be achieved when matrix_approximation_rank is 1.

Once gradient tensors are aggregated across all workers, this hook applies compression as follows:

Views the input flattened 1D gradient tensor as a square-shaped tensor M with 0 paddings;

Creates two low-rank tensors P and Q for decomposing M, such that M = PQ^T, where Q is initialized from a standard normal distribution and orthogonalized;

Computes P, which is equal to MQ;

Computes Q, which is approximately equal to M^TP;

Computes M, which is approximately equal to PQ^T.

Truncates the input tensor to the original length.

Note that this communication hook enforces vanilla allreduce for the first state.start_powerSGD_iter iterations. This not only gives the user more control over the tradeoff between speedup and accuracy, but also helps abstract away some complexity of the internal optimization of DDP for future communication hook developers.

state (PowerSGDState) – State information to configure the compression rate and support error feedback, warm start, etc. To tune the compression configs, mainly need to tune matrix_approximation_rank and start_powerSGD_iter.

bucket (dist.GradBucket) – Bucket that stores a 1D flattened gradient tensor that batches multiple per-variable tensors. Note that since DDP comm hook only supports single process single device mode, only exactly one tensor is stored in this bucket.

Future handler of the communication, which updates the gradients in place.

As the name implies, debugging communication hooks are only used for debugging and performance optimization purpose.

Debugging communication hooks do not necessarily output the correct results.

Return a future that wraps the input, so it is a no-op that does not incur any communication overheads.

This hook should only be used for headroom analysis of allreduce optimization, instead of the normal gradient synchronization. For example, if only less than 10% speedup of training time can be observed after this hook is registered, it usually implies that allreduce is not a performance bottleneck for this case. Such instrumentation can be particularly useful if GPU traces cannot be easily retrieved or the trace analysis is complicated some factors such as the overlap between allreduce and computation or the desynchronization across ranks.

A stateful communication hook can be saved as a part of model checkpointing to enable trainer restarts. To make a hook serializable, __setstate__ and __getstate__ should be defined.

__getstate__ should exclude non-serializable attributes from a returned dictionary.

__setstate__ should properly initialize non-serializable attributes, excluded from a provided state.

PowerSGDState has __setstate__ and __getstate__ implemented and can be used as a reference.

Return a Dict[str, Any] which will be pickled and saved.

process_group is not serializable and excluded from a returned state.

Take a provided state and set to this PowerSGDState instance.

process_group is set to default.

Here is a simple, end-to-end example of saving and reloading PowerSGD state and hook.

Many thanks to PowerSGD paper author Thijs Vogels for the code review on PowerSGD communication hook, as well as the comparison experiments, which show that the performance of PowerSGD communication hook is on par with the implementation in the original paper.

---

## Distributed Checkpoint - torch.distributed.checkpoint#

**URL:** https://pytorch.org/docs/stable/distributed.checkpoint.html

**Contents:**
- Distributed Checkpoint - torch.distributed.checkpoint#
- Additional resources:#

Created On: Nov 16, 2022 | Last Updated On: Sep 04, 2025

Distributed Checkpoint (DCP) support loading and saving models from multiple ranks in parallel. It handles load-time resharding which enables saving in one cluster topology and loading into another.

DCP is different than torch.save and torch.load in a few significant ways:

It produces multiple files per checkpoint, with at least one per rank.

It operates in place, meaning that the model should allocate its data first and DCP uses that storage instead.

The entrypoints to load and save a checkpoint are the following:

Getting Started with Distributed Checkpoint (DCP)

Asynchronous Saving with Distributed Checkpoint (DCP)

TorchTitan Checkpointing Docs

TorchTitan DCP Implementation

Enum for async checkpointer type.

This class contains futures for staging and upload completion. It is returned by async_save(). staging_completion is a future that indicates when local copy of state_dict is complete. upload_completion is a future that indicates when a checkpoint completed saving.

Save a distributed model in SPMD style.

This function is different from torch.save() as it handles ShardedTensor , and DTensor by having each rank only save their local shards.

For each Stateful object (having both a state_dict and a load_state_dict), save will call state_dict before serialization.

There is no guarantees of Backwards Compatibility across PyTorch versions for saved state_dicts.

If using the process_group argument, make sure that only its ranks call save_state_dict and that all data in state_dict belong to it.

When saving checkpoint for FSDP’s ShardingStrategy.HYBRID_SHARD, only one of the shard_group should be calling save_state_dict and the corresponding process group needs to be passed in.

state_dict in the local process.

state_dict (Dict[str, Any]) – The state_dict to save.

checkpoint_id (Union[str, os.PathLike, None]) – The ID of this checkpoint instance. The meaning of the checkpoint_id depends on the storage. It can be a path to a folder or to a file. It can also be a key if the storage is a key-value store. (Default: None)

storage_writer (Optional[StorageWriter]) – Instance of StorageWriter used to perform writes. If this is not specified, DCP will automatically infer the writer based on the checkpoint_id. If checkpoint_id is also None, an exception will be raised. (Default: None)

planner (Optional[SavePlanner]) – Instance of SavePlanner. If this is not specified, the default planner will be used. (Default: None)

process_group (Optional[ProcessGroup]) – ProcessGroup to be used for cross-rank synchronization. (Default: None)

no_dist (bool) – If True, this function will assume the intent is to load a checkpoint on a single rank/process. (Default: False)

use_collectives (bool) – If False, this function will assume the intent is to save a checkpoint without using cross-rank synchronization. (Default: True) This configuration is experimental and should be used with caution. It will change the format of the saved checkpoint and may not be backward compatible.

Metadata object for the saved checkpoint.

save_state_dict uses collectives to coordinate writes across ranks. For NCCL-based process groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

Asynchronous version of save. This code first de-stages the state_dict on to the staging storage (defaults to CPU memory), and then calls the save in a separate thread.

This feature is experimental and subject to change. MUST CALL CLOSE AFTER LAST CHECKPOINT IS SAVED

state_dict (Dict[str, Any]) – The state_dict to save.

checkpoint_id (Union[str, os.PathLike, None]) – The ID of this checkpoint instance. The meaning of the checkpoint_id depends on the storage. It can be a path to a folder or to a file. It can also be a key if the storage is a key-value store. (Default: None)

storage_writer (Optional[StorageWriter]) – Instance of StorageWriter used to perform ‘stage’ and ‘save’. If this is not specified, DCP will automatically infer the writer based on the checkpoint_id. If checkpoint_id is also None, an exception will be raised. (Default: None)

planner (Optional[SavePlanner]) – Instance of SavePlanner. If this is not specified, the default planner will be used. (Default: None)

process_group (Optional[ProcessGroup]) – ProcessGroup to be used for cross-rank synchronization. (Default: None)

async_checkpointer_type (AsyncCheckpointerType) – whether to do checkpoint in separate thread or process (Default: AsyncCheckpointerType.THREAD)

async_stager (AsyncStager) – provides staging implementation. If storage_writer implements AsyncStager and async_stager is provided, async_stager will be used for staging

no_dist (bool) – If True, this function will assume the intent is to save a checkpoint on a single rank/process. (Default: False)

use_collectives (bool) – If False, Save the checkpoint without rank coordination. (Default: True) This configuration is experimental and should be used with caution. It will change the format of the saved checkpoint and may not be backward compatible.

A future holding the resultant Metadata object from save.

This method is deprecated. Please switch to ‘save’.

Load a checkpoint into a distributed state dict in SPMD style.

Each rank must have the same keys in their state_dict provided to this API. Mismatched keys may result in hangs or errors. If unsure, you can use the utils._assert_same_keys API to check (but may incur communication costs).

Each rank will try to read the least amount of data necessary to fulfill the requested state_dict. When loading ShardedTensor or DTensor instances, each rank only reads data for their local shards.

For each Stateful object (having both a state_dict and a load_state_dict), load will first call state_dict before attempting deserialization, followed by load_state_dict once the deserialization is complete. For each non-Stateful object, load will deserialize the object, and then replace it in the state_dict with the deserialized object.

All tensors in state_dict must be allocated on their destination device prior to calling this function.

All non-tensor data is loaded using torch.load() and modified in place on state_dict.

Users must call load_state_dict on the root module to ensure load pos-processing and non-tensor data properly propagates.

state_dict (Dict[str, Any]) – The state_dict to load the checkpoint into.

checkpoint_id (Union[str, os.PathLike, None]) – The ID of this checkpoint instance. The meaning of the checkpoint_id depends on the storage. It can be a path to a folder or to a file. It can also be a key if the storage is a key-value store. (Default: None)

storage_reader (Optional[StorageReader]) – Instance of StorageWriter used to perform reads. If this is not specified, DCP will automatically infer the reader based on the checkpoint_id. If checkpoint_id is also None, an exception will be raised. (Default: None)

planner (Optional[LoadPlanner]) – Instance of LoadPlanner. If this is not specified, the default planner will be used. (Default: None)

process_group (Optional[ProcessGroup]) – ProcessGroup to be used for cross-rank synchronization. (Default: None)

no_dist (bool) – If True, this function will assume the intent is to load a checkpoint without using cross-rank synchronization. (Default: False)

load_state_dict uses collectives to coordinate reads across ranks. For NCCL-based process groups, internal tensor representations of objects must be moved to the GPU device before communication takes place. In this case, the device used is given by torch.cuda.current_device() and it is the user’s responsibility to ensure that this is set so that each rank has an individual GPU, via torch.cuda.set_device().

This method is deprecated. Please switch to ‘load’.

The following module is also useful for additional customization of the staging mechanisms used for asynchronous checkpointing (torch.distributed.checkpoint.async_save):

This protocol is meant to provide customization and extensibility for dcp.async_save, allowing users to customize how data is staged previous to executing the usual dcp.save path in parallel. The expected order of operations (concretely defined in torch.distributed.state_dict_saver.async_save) is the following:

This call gives the AsyncStager the opportunity to ‘stage’ the state_dict. The expectation and purpose of staging in this context is to create a “training-safe” representation of the state dict, meaning that any updates to module data after staging is complete should not be reflected in the state dict returned from this method. For example, in the default case a copy of the entire state dict is created on CPU RAM and returned here, allowing users to continue training without risking changes to data which is being serialized.

for serializing the state_dict and writing it to storage.

the serialization thread starts and before returning from dcp.async_save. If this is set to False, the assumption is the user has defined a custom synchronization point for the purpose of further optimizing save latency in the training loop (for example, by overlapping staging with the forward/backward pass), and it is the respondsibility of the user to call AsyncStager.synchronize_staging at the appropriate time.

Clean up all resources used by the stager.

Whether to synchronize after executing the stage.

Returns a “staged” copy of state_dict. The expectation of the staged copy is that it is inoculated from any updates incurred after the stage call is complete.

Union[Future[dict[str, Union[~StatefulT, Any]]], dict[str, Union[~StatefulT, Any]]]

In the case stage is async in some way, this method should be called to ensure staging is complete and it is safe to begin modifying the original state_dict

DefaultStager provides a full-featured staging implementation that combines multiple optimization techniques for efficient checkpoint preparation.

The staging process works as follows: 1. State dictionary is submitted for staging (sync or async) 2. Tensors are copied from GPU to optimized CPU storage 3. CUDA operations are synchronized if non-blocking copies are used 4. Staged state dictionary is returned or made available via Future

# Synchronous staging stager = DefaultStager(StagingOptions(use_async_staging=False)) staged_dict = stager.stage(state_dict) stager.close()

# Asynchronous staging stager = DefaultStager(StagingOptions(use_async_staging=True)) future = stager.stage(state_dict) # … do other work … staged_dict = future.result() stager.close()

# Context manager pattern (recommended) stager = DefaultStager(config) with stager: result = stager.stage(state_dict)

Async staging provides best performance when model computation can overlap with staging operations

Pinned memory improves CPU-GPU transfer speeds but uses more memory

Shared memory allows efficient IPC to checkpoint process

Non-blocking copies reduce GPU idle time during memory transfers

DefaultStager is not thread-safe. Each thread should use its own instance, or external synchronization should be provided.

Clean up all resources used by the DefaultStager. Shuts down the ThreadPoolExecutor used for async staging operations and cleans up the underlying StateDictStager’s cached storages. Should be called when the stager is no longer needed to prevent resource leaks, especially in long-running applications. After calling close(), the stager should not be used for further staging operations.

stager = DefaultStager(StagingOptions(use_async_staging=True)) future = stager.stage(state_dict) result = future.result() stager.close() # Clean up all resources

This function is responsible for staging staging the state_dict. See class docstring for more details on staging. If use_async_staging is True, it will return a Future object that will be fulfilled when staging is complete. If use_async_staging is False, it will return the fully staged state_dict.

state_dict (STATE_DICT_TYPE) – The state_dict to be staged.

Union[dict[str, Union[~StatefulT, Any]], Future[dict[str, Union[~StatefulT, Any]]]]

When use_async_staging is True, this method will wait until staging is complete. If use_async_staging is False, this method is a no-op.

Configuration options for checkpoint staging behavior.

use_pinned_memory (bool) – Enable pinned memory allocation for faster CPU-GPU transfers. Requires CUDA to be available. Default: True

use_shared_memory (bool) – Enable shared memory for multi-process scenarios. Useful when multiple processes need access to the same staged data. Default: True

use_async_staging (bool) – Enable asynchronous staging using a background thread pool. Allows overlapping computation with staging operations. Requires CUDA. Default: True

use_non_blocking_copy (bool) – Use non-blocking device memory copies with stream synchronization. Improves performance by allowing CPU work to continue during GPU transfers. Default: True

CUDA-dependent features will raise exception if CUDA is not available.

An implementation of AsyncStager which stages the state_dict on CPU RAM and blocks until the copy is complete. This implementation also provides an option to optimize stage latency using pinned memory.

N.B. synchronize_staging is a no-op in this case.

Returns a copy of state_dict on the CPU.

dict[str, Union[~StatefulT, Any]]

No-op function, since staging is blocking.

In addition to the above entrypoints, Stateful objects, as described below, provide additional customization during saving/loading

Stateful protocol for objects that can be checkpointed and restored.

Restore the object’s state from the provided state_dict.

state_dict (dict[str, Any]) – The state dict to restore from

Objects should return their state_dict representation as a dictionary. The output of this function will be checkpointed, and later restored in load_state_dict().

Because of the inplace nature of restoring a checkpoint, this function is also called during torch.distributed.checkpoint.load.

The objects state dict

This example shows how to use Pytorch Distributed Checkpoint to save a FSDP model.

The following types define the IO interface used during checkpoint:

Interface used by load_state_dict to read from storage.

One StorageReader instance acts as both the coordinator and the follower in a distributed checkpoint. As part of initialization, each instance is told its role.

A subclass should expected the following sequence of calls by load_state_dict:

(all ranks) set checkpoint_id if users pass a valid checkpoint_id.

(all ranks) read_metadata()

(all ranks) set_up_storage_reader()

(all ranks) prepare_local_plan()

(coordinator) prepare_global_plan()

(all ranks) read_data()

Perform centralized planning of storage loading.

This method is only called on the coordinator instance.

While this method can produce a completely different plan, the preferred way is to store storage specific data in LoadPlan::storage_data.

plans (list[torch.distributed.checkpoint.planner.LoadPlan]) – A list of LoadPlan instances, one for each rank.

A list of transformed LoadPlan after storage global planning

list[torch.distributed.checkpoint.planner.LoadPlan]

Perform storage-specific local planning.

While this method can produce a completely different plan, the recommended way is to store storage specific data in LoadPlan::storage_data.

plan (LoadPlan) – The local plan from the LoadPlan in use.

A transformed LoadPlan after storage local planning

Read all items from plan using planner to resolve the data.

A subclass should call LoadPlanner::load_bytes to deserialize a BytesIO object into the right place.

A subclass should call LoadPlanner::resolve_tensor to get access to the tensors that in should load data into.

It’s the StorageLayer responsibility to properly schedule any cross device copies required.

plan (LoadPlan) – The local plan to execute on

planner (LoadPlanner) – The planner object to use to resolve items.

A future that completes once all reads are finished.

Read the checkpoint metadata.

The metadata object associated with the checkpoint being loaded.

Calls to indicates a brand new checkpoint read is going to happen. A checkpoint_id may be present if users set the checkpoint_id for this checkpoint read. The meaning of the checkpoint_id is storage-dependent. It can be a path to a folder/file or a key for a key-value storage.

checkpoint_id (Union[str, os.PathLike, None]) – The ID of this checkpoint instance. The meaning of the checkpoint_id depends on the storage. It can be a path to a folder or to a file. It can also be a key if the storage is more like a key-value store. (Default: None)

Initialize this instance.

metadata (Metadata) – The metadata schema to use.

is_coordinator (bool) – Whether this instance is responsible for coordinating the checkpoint.

Check if the given checkpoint_id is supported by the storage. This allow us to enable automatic storage selection.

Interface used by save_state_dict to write to storage.

One StorageWriter instance acts as both the coordinator and the follower in a distributed checkpoint. As part of initialization, each instance is told its role.

A subclass should expect the following sequence of calls.

(all ranks) set checkpoint_id if users pass a valid checkpoint_id.

(all ranks) set_up_storage_writer()

(all ranks) prepare_local_plan()

(coordinator) prepare_global_plan()

(all ranks) write_data()

(coordinator) finish()

Write the metadata and marks the current checkpoint as successful.

The actual format/schema used for serializing metadata is an implementation detail. The only requirement is that it’s recoverable in to the same object graph.

metadata (Metadata) – metadata for the new checkpoint

results (list[list[torch.distributed.checkpoint.storage.WriteResult]]) – A list of WriteResults from all ranks.

Perform centralized planning of storage.

This method is only called on the coordinator instance.

While this method can produce a completely different plan, the preferred way is to store storage specific data in SavePlan::storage_data.

plans (list[torch.distributed.checkpoint.planner.SavePlan]) – A list of SavePlan instances, one for each rank.

A list of transformed SavePlan after storage global planning

list[torch.distributed.checkpoint.planner.SavePlan]

Perform storage-specific local planning.

While this method can produce a completely different plan, the recommended way is to store storage specific data in SavePlan::storage_data.

plan (SavePlan) – The local plan from the SavePlanner in use.

A transformed SavePlan after storage local planning

Calls to indicates a brand new checkpoint write is going to happen. A checkpoint_id may be present if users set the checkpoint_id for this checkpoint write. The meaning of the checkpoint_id is storage-dependent. It can be a path to a folder/file or a key for a key-value storage.

checkpoint_id (Union[str, os.PathLike, None]) – The ID of this checkpoint instance. The meaning of the checkpoint_id depends on the storage. It can be a path to a folder or to a file. It can also be a key if the storage is a key-value store. (Default: None)

Initialize this instance.

is_coordinator (bool) – Whether this instance is responsible for coordinating the checkpoint.

Return the storage-specific metadata. This is used to store additional information in a checkpoint that can be useful for providing request-level observability. StorageMeta is passed to the SavePlanner during save calls. Returns None by default.

Example:

```python
from torch.distributed.checkpoint.storage import StorageMeta

class CustomStorageBackend:
    def get_storage_metadata(self):
        # Return storage-specific metadata that will be stored with the checkpoint
        return StorageMeta()
```

This example shows how a storage backend can return `StorageMeta`
to attach additional metadata to a checkpoint.

Optional[StorageMeta]

Check if the given checkpoint_id is supported by the storage. This allow us to enable automatic storage selection.

Write all items from plan using planner to resolve the data.

A subclass should call SavePlanner::resolve_data on each item from the plan to get access to the underlying object to write.

Subclasses should lazily call resolve_data as it can allocate memory. In case of tensors, make following assumptions:

They might be on any device, including not matching the one on WriteItem::tensor_data

They might be views or not contiguous. Only the projection needs to be saved.

plan (SavePlan) – The save plan to execute.

planner (SavePlanner) – Planner object to be used to resolve items to data.

A future that completes to a list of WriteResult

Future[list[torch.distributed.checkpoint.storage.WriteResult]]

The following types define the planner interface used during checkpoint:

Abstract class defining the protocol used by load_state_dict to plan the load process.

LoadPlanner are stateful objects that can be used to customize the whole load process.

LoadPlanner acts as an access proxy to the state_dict, so any transformation done to it will be visible to the whole process.

A planner subclass can expect the following sequence of calls during load_state_dict:

Signals the start of loading a checkpoint.

Process the state_dict and produces a LoadPlan that will be sent for global planning.

Takes the LoadPlan from all ranks and make any global decision.

This is called once per non-tensor value in state_dict.

They are called in pair for each Tensor value in state_dict.

Users are recommended to extend DefaultLoadPlanner instead of this interface directly as most changes can be expressed by changes in a single method.

There are two usual patterns of extension:

Rewriting state_dict. This is the simplest way to extend the load process as it doesn’t requite understanding the intrincacies of how LoadPlan works. We need to keep a reference to the original state_dict as load happens in place so we need to be able to perform it in place

Modifying resolve_tensor and commit_tensor to handle load time transformation.

Call once the StorageReader finished loading data into tensor.

The provided tensor is the same one returned by the call to resolve_tensor. This method is only needed if this LoadPlanner needs to post process tensor prior to copying it back to the one in the state_dict.

The contents of tensor will follow its device synchronization model.

Compute the global load plan and return plans for each rank.

. N.B. This is called on the coordinator rank only

list[torch.distributed.checkpoint.planner.LoadPlan]

Create a LoadPlan based on state_dict and metadata provided by set_up_planner.

. N.B. This is called on every rank.

Accept the plan from coordinator and return final LoadPlan.

Load the item described by read_item``and ``value.

This method is expected to modify in-place the underlying state_dict.

The contents of value are defined by the SavePlanner used to produce the checkpoint being loaded.

Return the BytesIO to be used by the StorageReader to load read_item.

The BytesIO should alias with one on the underlying state_dict as StorageReader will replace its contents.

Return the tensor described by read_item to be used by the StorageReader to load read_item.

The tensor should alias with one on the underlying state_dict as StorageReader will replace its contents. If, for any reason, that’s not possible, the planner can use the commit_tensor method to copy the data back to the one in state_dict.

Initialize this instance to load data into state_dict.

. N.B. This is called on every rank.

Abstract class defining the protocol used by save_state_dict to plan the save process.

SavePlanners are stateful objects that can be used to customize the whole save process.

SavePlanner acts as an access proxy to the state_dict, so any transformation done to it will be visible to the whole process.

A planner subclass can expect the following sequence of calls during save_state_dict:

Signals the start of a checkpoint save.

Process the state_dict and produces a SavePlan that will be sent for global planning.

Takes the SavePlan from all ranks and make any global decision.

This gives each rank a chance to adjust to global planning decisions.

Lookups a value on the state_dict for the storage layer to write.

Users are recommended to extend DefaultSavePlanner instead of this interface directly as most changes can be expressed by changes in a single method.

There are 3 usual patterns of extension:

Rewriting state_dict. This is the simplest way to extend the save process as it doesn’t requite understanding the intrincacies of how SavePlan works:

Modifying local plan and lookup in tandem. This is useful when fine control of how data is persisted

Using the global planning step to make central decisions that can’t be made individually by each rank

Finally, some planners need to save additional metadata in the checkpoint, this is accomplished by having each rank contribute their data items in the local plan and the global planner aggregate them:

Compute the global checkpoint plan and return the local plan of each rank.

This is called on the coordinator rank only.

tuple[list[torch.distributed.checkpoint.planner.SavePlan], torch.distributed.checkpoint.metadata.Metadata]

Compute the save plan for the current rank.

This will be aggregated and passed to create_global_plan. Planner specific data can be passed through SavePlan::planner_data.

This is called on all ranks.

Merge the plan created by create_local_plan and the result of create_global_plan.

This is called on all ranks.

Transform and prepare write_item from state_dict for storage, ensuring idempotency and thread-safety.

Lookup the object associated with write_item in state_dict and apply any transformation (such as serialization) prior to the storage layer consuming it.

Called on each rank multiple times, at least once per WriteItem in the final SavePlan.

This method should be idempotent and thread-save. StorageWriter implementations are free to call it as frequently as they need.

Any transformation that allocates memory should be lazily done when his method is called in order to reduce peak memory required by checkpointing.

When returning tensors, they can be on any device or format, they can be views too. It’s the storage layer responsibility to figure out how to save them.

Union[Tensor, BytesIO]

Initialize this planner to save state_dict.

Implementations should save those values as they won’t be provided lated in the save process.

This is called on all ranks.

Dataclass which holds information about what needs to be written to storage.

Calculates the storage size of the underlying tensor, or None if this is not a tensor write.

Optional[int] storage size, in bytes of underlying tensor if any.

We provide a filesystem based storage layer:

return the checkpoint_id that will be used to load the checkpoint.

Basic implementation of StorageWriter using file IO.

This implementation makes the following assumptions and simplifications:

The checkpoint path is an empty or non-existing directory.

File creation is atomic

The checkpoint consist of one file per write request plus a global .metadata file with the serialized metadata if rank coordination is enabled. a rank local __{rank}.metadata file with the serialized metadata if rank coordination is NOT enabled.

Override of AsyncStager.stage

dict[str, Union[~StatefulT, Any]]

We also provide other storage layers, including ones to interact with HuggingFace safetensors:

.. autoclass:: torch.distributed.checkpoint.HuggingFaceStorageReader :members:

.. autoclass:: torch.distributed.checkpoint.HuggingFaceStorageWriter :members:

.. autoclass:: torch.distributed.checkpoint.QuantizedHuggingFaceStorageReader :members:

We provide default implementations of LoadPlanner and SavePlanner that can handle all of torch.distributed constructs such as FSDP, DDP, ShardedTensor and DistributedTensor.

Extension from the planner interface to make it easy to extend the default planner.

Extension from the planner interface to make it easy to extend the default planner.

DefaultLoadPlanner that adds multiple features on top of LoadPlanner.

In particular it adds the following:

flatten_state_dict: Handle state_dict with nested dicts flatten_sharded_tensors: For FSDP in 2D parallel mode allow_partial_load: If False, will raise a runtime error if a key is present in state_dict, but not in the checkpoint.

Extension from the planner interface to make it easy to extend the default planner.

Extension from the planner interface to make it easy to extend the default planner.

Due to legacy design decisions, the state dictionaries of FSDP and DDP may have different keys or fully qualified names (e.g., layer1.weight) even when the original unparallelized model is identical. Moreover, FSDP offers various types of model state dictionaries, such as full and sharded state dictionaries. Additionally, optimizer state dictionaries employ parameter IDs instead of fully qualified names to identify parameters, potentially causing issues when parallelisms are used (e.g., pipeline parallelism).

To tackle these challenges, we offer a collection of APIs for users to easily manage state_dicts. get_model_state_dict() returns a model state dictionary with keys consistent with those returned by the unparallelized model state dictionary. Similarly, get_optimizer_state_dict() provides the optimizer state dictionary with keys uniform across all parallelisms applied. To achieve this consistency, get_optimizer_state_dict() converts parameter IDs to fully qualified names identical to those found in the unparallelized model state dictionary.

Note that results returned by these APIs can be used directly with the torch.distributed.checkpoint.save() and torch.distributed.checkpoint.load() methods without requiring any additional conversions.

set_model_state_dict() and set_optimizer_state_dict() are provided to load the model and optimizer state_dict generated by by their respective getter APIs.

Note that set_optimizer_state_dict() can only be called before backward() or after step() is called on optimizers.

Note that this feature is experimental, and API signatures might change in the future.

Return the model state_dict and optimizers state_dict.

get_state_dict can process any module that is parallelized by PyTorch FSDP/fully_shard, DDP/replicate, tensor_parallel/parallelize_module, and any combination of these parallelisms. The main functions of get_state_dict are: 1.) returning a model and optimizer state_dict that can be resharded with a different number of trainers and/or different parallelisms. 2.) hiding the parallelism-specific state_dict APIs. Users don’t have to call these APIs. 3.) sanity checking the result state_dict.

The keys of the result state dictionary are the canonical FQNs (Fully Qualified Names). A canonical FQN refers to the FQN based on a parameter’s position in an nn.Module hierarchy. More specifically, a canonical FQN to a parameter is the FQN returned by module.named_parameters() or module.named_buffers() when the module is not distributed by any parallelisms. Since the optimizer internally uses parameter IDs to represent a parameter, there will be a conversion from the parameter IDs to the canonical FQNs when calling this API.

get_state_dict can also process a module that is not parallelized. In such a case, get_state_dict only performs one function – converting the optimizer parameter IDs to the canonical FQNs.

model (nn.Module) – the nn.Module to the model.

optimizers (Union[None, Optimizer, Iterable[Optimizer]]) – The optimizers that are used to optimize model.

submodules (deprecated) – Optional[set[nn.Module]]: only return the model parameters that belong to the submodules.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be returned. See StateDictOptions for the details.

Tuple that contain model state_dict and optimizer state_dict.

Tuple[Dict[str, ValueType], OptimizerStateType]

Return the model state_dict of model.

See get_state_dict for the detail usage.

model (nn.Module) – the nn.Module to the model.

submodules (deprecated) – Optional[set[nn.Module]]: only return the model parameters that belong to the submodules.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be returned. See StateDictOptions for the details.

The state_dict for model.

Return the combined state_dict for optimizers.

See get_state_dict for the detail usage.

model (nn.Module) – the nn.Module to the model.

optimizers (Union[None, Optimizer, Iterable[Optimizer]]) – The optimizers that are used to optimize model.

submodules (deprecated) – Optional[set[nn.Module]]: only return the model parameters that belong to the submodules.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be returned. See StateDictOptions for the details.

The state_dict for optimizers.

Load the model state_dict and optimizers state_dict.

The counterpart of get_state_dict to set the state_dict to the model and optimizers. The given model_state_dict and optim_state_dict do not have to be returned by get_state_dict but must meet the following requirements: 1) all FQNs are canonical FQNs as defined in get_state_dict, 2) if a tensor is sharded, it must be either a ShardedTensor or DTensor, 3) optimizer state_dict cannot contain the parameter IDs; the keys should be the canonical FQNs.

is called on the optimizers. Otherwise, the optimizer states won’t be initialized correctly.

model (nn.Module) – the nn.Module to the model.

optimizers (Union[Optimizer, Iterable[Optimizer]]) – The optimizers that are used to optimize model.

model_state_dict (Dict[str, ValueType]) – (Union[Dict[nn.Module, Dict[str, ValueType]], Dict[str, ValueType]]): the model state_dict to load. If the key of the model_state_dict is nn.Module, the key is a submodule of model and the value should be the state_dict of the submodule. When loading the state_dict, the prefix of the submodule will be append to the state_dict.

optim_state_dict (OptimizerStateType) – OptimizerStateType: the optimizer state_dict to load.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be loaded. See StateDictOptions for the details.

missing_keys is a list of str containing the missing keys of the model state_dict. unexpected_keys is a list of str containing the unexpected keys of the model state_dict.

missing_keys is a list of str containing the missing keys of the model state_dict.

unexpected_keys is a list of str containing the unexpected keys of the model state_dict.

NamedTuple with missing_keys and unexpected_keys fields

Load the model state_dict.

The counterpart of get_model_state_dict to set the state_dict to the model. See set_state_dict for the detail usage.

model (nn.Module) – the nn.Module to the model.

model_state_dict (Dict[str, ValueType]) – (Dict[str, ValueType]): the model state_dict to load. If the key of the model_state_dict is nn.Module, the key is a submodule of model and the value should be the state_dict of the submodule. When loading the state_dict, the prefix of the submodule will be append to the state_dict.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be loaded. See StateDictOptions for the details.

missing_keys is a list of str containing the missing keys unexpected_keys is a list of str containing the unexpected keys

missing_keys is a list of str containing the missing keys

unexpected_keys is a list of str containing the unexpected keys

NamedTuple with missing_keys and unexpected_keys fields

Load the optimizers state_dict.

The counterpart of get_optimizer_state_dict to set the state_dict to the optimizers. See set_state_dict for the detail usage.

step() is called on the optimizers. Otherwise, the optimizer states won’t be initialized correctly.

model (nn.Module) – the nn.Module to the model.

optimizers (Union[Optimizer, Iterable[Optimizer]]) – The optimizers that are used to optimize model.

optim_state_dict (OptimizerStateType) – OptimizerStateType: the optimizer state_dict to load.

options (StateDictOptions) – the options to control how model state_dict and optimizer state_dict should be loaded. See StateDictOptions for the details.

This dataclass specifies how get_state_dict/set_state_dict will work.

full_state_dict: if this is set to True, all the tensors in the returned state_dict will be gathered. No ShardedTensor and DTensor will be in the returned state_dict.

cpu_offload: offload all the tensors to cpu. To prevent CPU OOM, if full_state_dict is also true, then only the rank0 will get the state_dict and all other ranks will get empty state_dict.

ignore_frozen_params: if the value is True, the returned state_dict won’t contain any frozen parameters – the requires_grad is False. The default value is False.

keep_submodule_prefixes (deprecated): when submodules is not None, this option indicates whether to keep the submodule prefixes from the state_dict keys. or example, if the submodule is module.pretrain and the full FQN of the parameter is pretrain.layer1.weight of the param. When this option is True, the parameter’s key in the returned state_dict will be pretrain.layer1.weight. If the options is False, the key will be layer1.weight. Note that if keep_submodule_prefixes is False, there may be conflicted FQNs, hence there should be only one submodule in submodules.

strict: the strict option when set_state_dict calls model.load_state_dict().

full state_dict and will broadcast the tensors in the state_dict/ optim_state_dict one by one to other ranks. Other ranks will receive the tensors and shard according to the local shards in the model and optimizer. full_state_dict must be set to True when using this option. This option currently only supports DTensor, not the legacy ShardedTensor.

For users which are used to using and sharing models in the torch.save format, the following methods are provided which provide offline utilities for converting betweeing formats.

Given a directory containing a DCP checkpoint, this function will convert it into a Torch save file.

dcp_checkpoint_dir (Union[str, PathLike]) – Directory containing the DCP checkpoint.

torch_save_path (Union[str, PathLike]) – Filename to store the converted Torch save file.

To avoid OOM, it’s recommended to only run this function on a single rank.

Given the location of a torch save file, converts it into a DCP checkpoint.

torch_save_path (Union[str, PathLike]) – Filename of the Torch save file.

dcp_checkpoint_dir (Union[str, PathLike]) – Directory to store the DCP checkpoint.

To avoid OOM, it’s recommended to only run this function on a single rank.

The following classes can also be utilized for online loading and resharding of models from the torch.save format.

StorageReader for reading a Torch Save file. This reader will read the entire checkpoint on the coordinator rank, and then broadcast and shard each tensor to all ranks.

. N.B. Intended to be used with DynamicMetaLoadPlanner

Current implementation only supports loading Tensors.

Implementation of the StorageReader method

list[torch.distributed.checkpoint.planner.LoadPlan]

Implementation of the StorageReader method

Reads torch save data on the coordinator rank, and broadcast afterwards this incurrs a communication cost, but avoids having to load the entire checkpoint on each rank, hopefully preventing OOM issues

Extends the default StorageReader to support building the metadata file

Implementation of the StorageReader method

Implementation of the StorageReader method

Implementation of the StorageReader method

Extension of DefaultLoadPlanner, which creates a new Metadata object based on the passed in state dict, avoiding the need to read metadata from disk. This is useful when reading formats which don’t have a metadata file, like Torch Save files.

. N.B. Intended to be used with BroadcastingTorchSaveReader

Current implementation only supports loading Tensors.

Setups of the planner, extnding default behavior by creating the Metadata object from the state dict

The following experimental interfaces are provided for improved observability in production environments:

---

## torch.distributed.tensor#

**URL:** https://pytorch.org/docs/stable/distributed.tensor.html

**Contents:**
- torch.distributed.tensor#
- PyTorch DTensor (Distributed Tensor)#
  - DTensor Class APIs#
  - DeviceMesh as the distributed communicator#
  - DTensor Placement Types#
- Different ways to create a DTensor#
  - Create DTensor from a logical torch.Tensor#
  - DTensor Factory Functions#
  - Random Operations#
- Debugging#

Created On: Jun 13, 2025 | Last Updated On: Aug 23, 2025

torch.distributed.tensor is currently in alpha state and under development, we are committing backward compatibility for the most APIs listed in the doc, but there might be API changes if necessary.

PyTorch DTensor offers simple and flexible tensor sharding primitives that transparently handles distributed logic, including sharded storage, operator computation and collective communications across devices/hosts. DTensor could be used to build different parallelism solutions and support sharded state_dict representation when working with multi-dimensional sharding.

Please see examples from the PyTorch native parallelism solutions that are built on top of DTensor:

DTensor follows the SPMD (single program, multiple data) programming model to empower users to write distributed program as if it’s a single-device program with the same convergence property. It provides a uniform tensor sharding layout (DTensor Layout) through specifying the DeviceMesh and Placement:

DeviceMesh represents the device topology and the communicators of the cluster using an n-dimensional array.

Placement describes the sharding layout of the logical tensor on the DeviceMesh. DTensor supports three types of placements: Shard, Replicate and Partial.

DTensor is a torch.Tensor subclass. This means once a DTensor is created, it could be used in very similar way to torch.Tensor, including running different types of PyTorch operators as if running them in a single device, allowing proper distributed computation for PyTorch operators.

In addition to existing torch.Tensor methods, it also offers a set of additional methods to interact with torch.Tensor, redistribute the DTensor Layout to a new DTensor, get the full tensor content on all devices, etc.

DTensor (Distributed Tensor) is a subclass of torch.Tensor that provides single-device like abstraction to program with multi-device torch.Tensor. It describes the distributed tensor sharding layout (DTensor Layout) through the DeviceMesh and following types of Placement:

Shard: Tensor sharded on the tensor dimension dim on the devices of the DeviceMesh dimension

Replicate: Tensor replicated on the devices of the DeviceMesh dimension

Partial: Tensor is pending reduction on the devices of the DeviceMesh dimension

When calling PyTorch operators, DTensor overrides the PyTorch operators to perform sharded computation and issue communications whenever necessary. Along with the operator computation, DTensor will transform or propagate the placements (DTensor Layout) properly (based on the operator semantic itself) and generate new DTensor outputs.

To ensure numerical correctness of the DTensor sharded computation when calling PyTorch operators, DTensor requires every Tensor argument of the operator be DTensor.

Directly using the Tensor subclass constructor here is not the recommended way to create a DTensor (i.e. it does not handle autograd correctly hence is not the public API). Please refer to the create_dtensor section to see how to create a DTensor.

Return a list of ChunkStorageMetadata, which is a dataclass that describes the size/offset of the local shard/replica on current rank. For DTensor, each rank will have a single local shard/replica, so the returned list usually only has one element.

This dunder method is primariy used for distributed checkpoint purpose.

A List[ChunkStorageMetadata] object that represents the shard size/offset on the current rank.

Create a DTensor from a local torch.Tensor on each rank according to the device_mesh and placements specified.

local_tensor (torch.Tensor) – local torch.Tensor on each rank.

device_mesh (DeviceMesh, optional) – DeviceMesh to place the tensor, if not specified, must be called under a DeviceMesh context manager, default: None

placements (List[Placement], optional) – the placements that describes how to place the local torch.Tensor on DeviceMesh, must have the same number of elements as device_mesh.ndim.

run_check (bool, optional) – at a cost of extra communications, perform sanity check across ranks to check each local tensor’s meta information to ensure correctness. If have Replicate in placements, the data on first rank of the device mesh dimension will be broadcasted to other ranks. default: False

shape (torch.Size, optional) – A List of int which specifies the size of DTensor which build on top of local_tensor. Note this needs to be provided if the shape of local_tensor are different across the ranks. If not provided, shape will be computed assuming the given distributed tensor is evenly sharded across ranks. default: None

stride (tuple, optional) – A List of int which specifies the stride of DTensor. If not provided, stride will be computed assuming the given distributed tensor is evenly sharded across ranks. default: None

When run_check=False, it is the user’s responsibility to ensure the local tensor passed in is correct across ranks (i.e. the tensor is sharded for the Shard(dim) placement or replicated for the Replicate() placement). If not, the behavior of the created DTensor is undefined.

from_local is differentiable, the requires_grad of the created DTensor object will depend on if local_tensor requires_grad or not.

Return the full tensor of this DTensor. It will perform necessary collectives to gather the local tensors from other ranks in its DeviceMesh and concatenate them together. It’s a syntactic sugar of the following code:

dtensor.redistribute(placements=[Replicate()] * mesh.ndim).to_local()

grad_placements (List[Placement], optional) – the placements describes the future layout of any gradient layout of the full Tensor returned from this function. full_tensor converts DTensor to a full torch.Tensor and the returned torch.tensor might not be used as the original replicated DTensor layout later in the code. This argument is the hint that user can give to autograd in case the gradient layout of the returned tensor does not match the original replicated DTensor layout. If not specified, we will assume the gradient layout of the full tensor be replicated.

A torch.Tensor object that represents the full tensor of this DTensor.

full_tensor is differentiable.

redistribute performs necessary collective operations that redistribute the current DTensor from its current placements to a new placements, or from its current DeviceMesh to a new DeviceMesh. i.e. we can turn a Sharded DTensor to a Replicated DTensor by specifying a Replicate placement for each dimension of the DeviceMesh.

When redistributing from current to the new placements on one device mesh dimension, we will perform the following operations including communication collective or local operation:

Shard(dim) -> Replicate(): all_gather

Shard(src_dim) -> Shard(dst_dim): all_to_all

Replicate() -> Shard(dim): local chunking (i.e. torch.chunk)

Partial() -> Replicate(): all_reduce

Partial() -> Shard(dim): reduce_scatter

redistribute would correctly figure out the necessary redistribute steps for DTensors that are created either on 1-D or N-D DeviceMesh.

device_mesh (DeviceMesh, optional) – DeviceMesh to place the DTensor. If not specified, it would use the current DTensor’s DeviceMesh. default: None

placements (List[Placement], optional) – the new placements that describes how to place the DTensor into the DeviceMesh, must have the same number of elements as device_mesh.ndim. default: replicate on all mesh dimensions

async_op (bool, optional) – whether to perform the DTensor redistribute operation asynchronously or not. Default: False

forward_dtype (torch.dtype, optional) – the local tensor datatype can be converted to forward_dtype before redistributing the local tensor in its forward. The result DTensor will be in forward_dtype Default: None.

backward_dtype (torch.dtype, optional) – the local tensor datatype can be converted to backward_dtype before redistributing the local tensor in its backward. The result DTensor gradient would be converted back to the current DTensor dtype. Default: None

redistribute is differentiable, which means user do not need to worry about the backward formula of the redistribute operation.

redistribute currently only supports redistributing DTensor on the same DeviceMesh, Please file an issue if you need to redistribute DTensor to different DeviceMesh.

Get the local tensor of this DTensor on its current rank. For sharding it returns a local shard of the logical tensor view, for replication it returns the replica on its current rank.

grad_placements (List[Placement], optional) – the placements describes the future layout of any gradient layout of the Tensor returned from this function. to_local converts DTensor to local tensor and the returned local tensor might not be used as the original DTensor layout later in the code. This argument is the hint that user can give to autograd in case the gradient layout of the returned tensor does not match the original DTensor layout. If not specified, we will assume the gradient layout remains the same as the original DTensor and use that for gradient computation.

A torch.Tensor or AsyncCollectiveTensor object. it represents the local tensor on its current rank. When an AsyncCollectiveTensor object is returned, it means the local tensor is not ready yet (i.e. communication is not finished). In this case, user needs to call wait to wait the local tensor to be ready.

to_local is differentiable, the requires_grad of the local tensor returned will depend on if the DTensor requires_grad or not.

The DeviceMesh attribute that associates with this DTensor object.

device_mesh is a read-only property, it can not be set.

The placements attribute of this DTensor that describes the layout of this DTensor on the its DeviceMesh.

placements is a read-only property, it can not be set.

DeviceMesh was built from DTensor as the abstraction to describe cluster’s device topology and represent multi-dimensional communicators (on top of ProcessGroup). To see the details of how to create/use a DeviceMesh, please refer to the DeviceMesh recipe.

DTensor supports the following types of Placement on each DeviceMesh dimension:

The Shard(dim) placement describes the DTensor sharding on tensor dimension dim over a corresponding DeviceMesh dimension, where each rank on the DeviceMesh dimension only holds a shard/piece of the global Tensor. The Shard(dim) placement follows the torch.chunk(dim) semantic, where the last few shards on the DeviceMesh dimension might be empty when the tensor dimension is not evenly divisible on the DeviceMesh dimension. The Shard placement can be used by all DTensor APIs (i.e. distribute_tensor, from_local, etc.)

dim (int) – The tensor dimension that describes the DTensor is sharded over its corresponding DeviceMesh dimension.

sharding on a tensor dimension where the tensor dimension size is not evenly divisible on a DeviceMesh dimension is currently experimental and subject to change.

The Replicate() placement describes the DTensor replicating on a corresponding DeviceMesh dimension, where each rank on the DeviceMesh dimension holds a replica of the global Tensor. The Replicate placement can be used by all DTensor APIs (i.e. distribute_tensor, DTensor.from_local, etc.)

The Partial(reduce_op) placement describes the DTensor that is pending reduction on a specified DeviceMesh dimension, where each rank on the DeviceMesh dimension holds the partial value of the global Tensor. User can redistribute the Partial DTensor to a Replicate or Shard(dim) placement on the specified DeviceMesh dimension using redistribute, which would trigger necessary communication operations under the hood (i.e. allreduce, reduce_scatter).

reduce_op (str, optional) – The reduction op to be used for the partial DTensor to produce Replicated/Sharded DTensor. Only element-wise reduction operations are supported, including: “sum”, “avg”, “product”, “max”, “min”, default: “sum”.

The Partial placement can be generated as a result of the DTensor operators, and can only be used by the DTensor.from_local API.

The base class for the Placement type, where it describes how a DTensor is placed onto the DeviceMesh. Placement and DeviceMesh together could describe the DTensor Layout. It is the base class of the three main DTensor Placement types: Shard, Replicate, and Partial.

This class is not meant to be used directly, mainly served as a typing stub.

distribute_tensor() creates a DTensor from a logical or “global” torch.Tensor on each rank. This could be used to shard the leaf torch.Tensor s (i.e. model parameters/buffers and inputs).

DTensor.from_local() creates a DTensor from a local torch.Tensor on each rank, which can be used to create DTensor from a non-leaf torch.Tensor s (i.e. intermediate activation tensors during forward/backward).

DTensor provides dedicated tensor factory functions (e.g. empty(), ones(), randn(), etc.) to allow different DTensor creations by directly specifying the DeviceMesh and Placement. Compare to distribute_tensor(), this could directly materializing the sharded memory on device, instead of performing sharding after initializing the logical Tensor memory.

The SPMD (single program, multiple data) programming model in torch.distributed launches multiple processes (i.e. via torchrun) to execute the same program, this means that the model inside the program would be initialized on different processes first (i.e. the model might be initialized on CPU, or meta device, or directly on GPU if enough memory).

DTensor offers a distribute_tensor() API that could shard the model weights or Tensors to DTensor s, where it would create a DTensor from the “logical” Tensor on each process. This would empower the created DTensor s to comply with the single device semantic, which is critical for numerical correctness.

Distribute a leaf torch.Tensor (i.e. nn.Parameter/buffers) to the device_mesh according to the placements specified. The rank of device_mesh and placements must be the same. The tensor to distribute is the logical or “global” tensor, and the API would use the tensor from first rank of the DeviceMesh dimension as the source of truth to preserve the single-device semantic. If you want to construct a DTensor in the middle of the Autograd computation, please use DTensor.from_local() instead.

tensor (torch.Tensor) – torch.Tensor to be distributed. Note that if you want to shard a tensor on a dimension that is not evenly divisible by the number of devices in that mesh dimension, we use torch.chunk semantic to shard the tensor and scatter the shards. The uneven sharding behavior is experimental and subject to change.

device_mesh (DeviceMesh, optional) – DeviceMesh to distribute the tensor, if not specified, must be called under a DeviceMesh context manager, default: None

placements (List[Placement], optional) – the placements that describes how to place the tensor on DeviceMesh, must have the same number of elements as device_mesh.ndim. If not specified, we will by default replicate the tensor across the device_mesh from the first rank of each dimension of the device_mesh.

src_data_rank (int, optional) – the rank of the source data for the logical/global tensor, it is used by distribute_tensor() to scatter/broadcast the shards/replicas to other ranks. By default, we use group_rank=0 on each DeviceMesh dimension as the source data to preserve the single-device semantic. If passing None explicitly, distribute_tensor() simply uses its local data instead of trying to preserve the single-device semantic via scatter/broadcast. Default: 0

A DTensor or XLAShardedTensor object.

When initialize the DeviceMesh with the xla device_type, distribute_tensor return XLAShardedTensor instead. see this issue for more details. The XLA integration is experimental and subject to change.

Along with distribute_tensor(), DTensor also offers a distribute_module() API to allow easier sharding on the nn.Module level

This function expose three functions to control the parameters/inputs/outputs of the module:

1. To perform sharding on the module before runtime execution by specifying the partition_fn (i.e. allow user to convert Module parameters to DTensor parameters according to the partition_fn specified). 2. To control the inputs or outputs of the module during runtime execution by specifying the input_fn and output_fn. (i.e. convert the input to DTensor, convert the output back to torch.Tensor)

module (nn.Module) – user module to be partitioned.

device_mesh (DeviceMesh) – the device mesh to place the module.

partition_fn (Callable) – the function to partition parameters (i.e. shard certain parameters across the device_mesh). If partition_fn is not specified, by default we replicate all module parameters of module across the mesh.

input_fn (Callable) – specify the input distribution, i.e. could control how the input of the module is sharded. input_fn will be installed as a module forward_pre_hook (pre forward hook).

output_fn (Callable) – specify the output distribution, i.e. could control how the output is sharded, or convert it back to torch.Tensor. output_fn will be installed as a module forward_hook (post forward hook).

A module that contains parameters/buffers that are all DTensor s.

When initialize the DeviceMesh with the xla device_type, distribute_module return nn.Module with PyTorch/XLA SPMD annotated parameters. See this issue for more details. The XLA integration is experimental and subject to change.

DTensor also provides dedicated tensor factory functions to allow creating DTensor directly using torch.Tensor like factory function APIs (i.e. torch.ones, torch.empty, etc), by additionally specifying the DeviceMesh and Placement for the DTensor created:

Returns a DTensor filled with the scalar value 0.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: zeros(1,2,3..) or zeros([1,2,3..]) or zeros((1,2,3..))

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()).

layout (torch.layout, optional) – the desired layout of returned DTensor. Default: torch.strided.

device_mesh – DeviceMesh type, contains the mesh info of ranks

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

Returns a DTensor filled with the scalar value 1, with the shape defined by the variable argument size.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: ones(1,2,3..) or ones([1,2,3..]) or ones((1,2,3..))

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()).

layout (torch.layout, optional) – the desired layout of returned DTensor. Default: torch.strided.

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

device_mesh – DeviceMesh type, contains the mesh info of ranks

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

Returns a DTensor filled with uninitialized data. The shape of the DTensor is defined by the variable argument size.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: empty(1,2,3..) or empty([1,2,3..]) or empty((1,2,3..))

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()). layout (torch.layout, optional): the desired layout of returned DTensor. Default: torch.strided.

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

device_mesh – DeviceMesh type, contains the mesh info of ranks

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

Returns a DTensor filled with fill_value according to device_mesh and placements, with the shape defined by the argument size.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: ones(1,2,3..) or ones([1,2,3..]) or ones((1,2,3..))

fill_value (Scalar) – the value to fill the output tensor with.

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()).

layout (torch.layout, optional) – the desired layout of returned DTensor. Default: torch.strided.

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

device_mesh – DeviceMesh type, contains the mesh info of ranks.

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

Returns a DTensor filled with random numbers from a uniform distribution on the interval [0, 1). The shape of the tensor is defined by the variable argument size.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: ones(1,2,3..) or ones([1,2,3..]) or ones((1,2,3..))

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()).

layout (torch.layout, optional) – the desired layout of returned DTensor. Default: torch.strided.

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

device_mesh – DeviceMesh type, contains the mesh info of ranks.

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

Returns a DTensor filled with random numbers from a normal distribution with mean 0 and variance 1. The shape of the tensor is defined by the variable argument size.

size (int...) – a sequence of integers defining the shape of the output DTensor. Can be a variable number of arguments or a collection like a list or tuple. E.g.: ones(1,2,3..) or ones([1,2,3..]) or ones((1,2,3..))

dtype (torch.dtype, optional) – the desired data type of returned DTensor. Default: if None, uses a global default (see torch.set_default_dtype()).

layout (torch.layout, optional) – the desired layout of returned DTensor. Default: torch.strided.

requires_grad (bool, optional) – If autograd should record operations on the returned DTensor. Default: False.

device_mesh – DeviceMesh type, contains the mesh info of ranks.

placements – a sequence of Placement type: Shard, Replicate

A DTensor object on each rank

DTensor provides distributed RNG functionality to ensure that random operations on sharded tensors get unique values, and random operations on replicated tensors get the same values. This system requires that all participating ranks (e.g. SPMD ranks) start out using the same generator state before each dtensor random operation is performed, and if this is true, it ensures they all end up at the same state after each dtensor random operation completes. There is no communication performed during random operations to synchronize RNG states.

Operators that accept a generator kwarg will utilize the user-passed generator, if passed, or the default generator for the device otherwise. Whichever generator is used, it will be advanced after the DTensor operation. It is valid to use the same generator for both DTensor and non-DTensor operations, but care must be taken to ensure the non-DTensor operations advance the generator state equally on all ranks if so.

When using DTensor together with Pipeline Parallelism, ranks for each pipeline stage should use a distinct seed, and ranks within a pipeline stage should use the same seed.

DTensor’s RNG infra is based on the philox based RNG algorithm, and supports any philox based backend (cuda, and other cuda-like devices), but unfortunately does not yet support the CPU backend.

When launching the program, you can turn on additional logging using the TORCH_LOGS environment variable from torch._logging :

TORCH_LOGS=+dtensor will display logging.DEBUG messages and all levels above it.

TORCH_LOGS=dtensor will display logging.INFO messages and above.

TORCH_LOGS=-dtensor will display logging.WARNING messages and above.

To debug the program that applied DTensor, and understand more details about what collectives happened under the hood, DTensor provides a CommDebugMode:

CommDebugMode is a context manager that counts the number of functional collectives within its context. It does this using a TorchDispatchMode.

Not all collectives are supported yet.

Generates detailed table displaying operations and collective tracing information on a module level. Amount of information is dependent on noise_level

prints module-level collective counts

prints dTensor operations not included in trivial operations, module information

prints operations not included in trivial operations

prints all operations

Creates json file used to build browser visual 0. prints module-level collective counts 1. prints dTensor operations not included in trivial operations 2. prints operations not included in trivial operations 3. prints all operations

Returns the communication counts as a dictionary.

The communication counts as a dictionary.

dict[str, dict[str, Any]]

dict[str, dict[str, Any]]

Alternative to console CommDebugMode output, writes to file specified by the user

To visualize the sharding of a DTensor that have less than 3 dimensions, DTensor provides visualize_sharding():

Visualizes sharding in the terminal for DTensor that are 1D or 2D.

This requires the tabulate package, or rich and matplotlib. No sharding info will be printed for empty tensors

DTensor also provides a set of experimental features. These features are either in prototyping stage, or the basic functionality is done and but looking for user feedbacks. Please submit a issue to PyTorch if you have feedbacks to these features.

context_parallel is an experimental API to enable context parallelism (CP). This API performs two actions: 1) patch the SDPA (torch.nn.functional.scaled_dot_product_attention) with the CP-enabled one, 2) shard buffers along the sequence dimension and each rank will preserve the corresponding shard according mesh.

mesh (DeviceMesh) – the device mesh for the context parallelism.

buffers (Optional[List[torch.Tensor]]) – buffers that the usage depend on the sequence dimension. Examples are input batch, labels and positional embedding buffers. These buffers must be sharded along the sequence dimension to ensure the accuracy. The sharding will happen in-place, the buffer’s shape will change within the context. The buffers will be restored after the context finishes. no_restore_buffers can be used to specify which buffers don’t need to be restored. Note that buffers should not contain any nn.Parameter.

buffer_seq_dims (Optional[List[int]]) – the sequence dimensions of buffers.

no_restore_buffers (Optional[Set[torch.Tensor]]) – buffers in these set won’t be restored after the context exits. This set must be a subset of buffers. If the buffers won’t be used after the context exits, these buffers can be put in this list to avoid extra restore time.

Generator[None, None, None]

torch.distributed.tensor.experimental.context_parallel is a prototype feature in PyTorch. The API is subject to change.

local_map() is an experimental API that allows users to pass DTensor s to a function that is written to be applied on torch.Tensor s. It is done by extracting the local components of DTensor, call the function, and wrap the outputs to DTensor according to the out_placements.

func (Callable) – the function to be applied on each local shard of DTensor s.

out_placements (Union[PlacementType, Tuple[PlacementType, …]]) – the desired placements of the DTensor s in func’s flattened output. If the flattened output is a single value, the out_placements should be of type PlacementType. Otherwise if the flattened output has multiple values, the out_placements should be a tuple of PlacementType values 1:1 mapping to the flattened output. Besides, for Tensor output, we use PlacementType as its placements (a Tuple[Placement] value). For non-Tensor output, the PlacementType should be None. Note that the only exception is when no DTensor argument is passed in. In this case, even if out_placements is not None, the result function should ignore the desired placements because the function is not running with DTensor s.

in_placements (Tuple[PlacementType, …], optional) – the required placements of the DTensor s in the flattened inputs of func. If in_placements is specified, local_map() would examine whether the placements of each DTensor argument is the same as the required placements or not. If the placements are not the same and redistribute_inputs is False, an exception will be raised. Otherwise if redistribute_inputs is True, the argument will be first redistributed to the required sharding placements before passing its local tensor to func. The only exception is when required placements are not None and the argument is a torch.Tensor. In this case, the placements examination will be skipped and the argument will be directly passed to func. If in_placements is None, no placements examination will be performed. Default: None

in_grad_placements (Tuple[PlacementType, …], optional) – the placements hint of the DTensor s gradient corresponds to the flattened input DTensor. This argument is the hint that user can give to to_local() in case the gradient layout of the local tensor input does not match its DTensor input layout. If not specified, we will assume the gradient layout of the local tensor input remains the same as the original DTensor input and use that for gradient computation. Default: None.

device_mesh (DeviceMesh, optional) – the device mesh that the output DTensor s are placed on. If not specified, this will be inferred from the first input DTensor’s device mesh. Default: None.

redistribute_inputs (bool, optional) – the bool value indicating whether to reshard the input DTensor s when their placements are different from the required input placements. If this value is False and some DTensor input has a different placement, an exception will be raised. Default: False.

A Callable that applies func to each local shard of the input DTensor and returns a DTensor constructed from the return value of func.

AssertionError – For any non-DTensor output, we require its corresponding output placement in out_placements be None. An AssertionError will be raised if this is not the case.

ValueError – If redistribute_inputs=False but the input DTensor needs a redistribution according to in_placements.

This API is currently experimental and subject to change

register_sharding() is an experimental API that allows users to register sharding strategies for an operator when the tensor inputs and outputs are DTensor. It can be useful when: (1) there doesn’t exist a default sharding strategy for op, e.g. when op is a custom operator that is not supported by DTensor; (2) when users would like to overwrite default sharding strategies of existing operators.

op (Union[OpOverload, List[OpOverload]]) – An op or a list of ops to register the customized sharding function.

A function decorator which can be used to wrap a function that defines the sharding strategy for the operator specified in op. The defined sharding strategy will be registered to DTensor and will override the default sharding strategy if DTensor has already implemented the operator. The customized sharding function takes the same inputs as the original op (except that if an arg is a torch.Tensor, it will be replaced by a tensor-like object that DTensor uses internally). The function should return a sequence of 2-tuples, each specifying acceptable output placements and its corresponding input placements.

This API is currently experimental and subject to change

---

## FullyShardedDataParallel#

**URL:** https://pytorch.org/docs/stable/fsdp.html

**Contents:**
- FullyShardedDataParallel#

Created On: Feb 02, 2022 | Last Updated On: Jun 11, 2025

A wrapper for sharding module parameters across data parallel workers.

This is inspired by Xu et al. as well as the ZeRO Stage 3 from DeepSpeed. FullyShardedDataParallel is commonly shortened to FSDP.

Using FSDP involves wrapping your module and then initializing your optimizer after. This is required since FSDP changes the parameter variables.

When setting up FSDP, you need to consider the destination CUDA device. If the device has an ID (dev_id), you have three options:

Place the module on that device

Set the device using torch.cuda.set_device(dev_id)

Pass dev_id into the device_id constructor argument.

This ensures that the FSDP instance’s compute device is the destination device. For option 1 and 3, the FSDP initialization always occurs on GPU. For option 2, the FSDP initialization happens on module’s current device, which may be a CPU.

If you’re using the sync_module_states=True flag, you need to ensure that the module is on a GPU or use the device_id argument to specify a CUDA device that FSDP will move the module to in the FSDP constructor. This is necessary because sync_module_states=True requires GPU communication.

FSDP also takes care of moving input tensors to the forward method to the GPU compute device, so you don’t need to manually move them from CPU.

For use_orig_params=True, ShardingStrategy.SHARD_GRAD_OP exposes the unsharded parameters, not the sharded parameters after forward, unlike ShardingStrategy.FULL_SHARD. If you want to inspect the gradients, you can use the summon_full_params method with with_grads=True.

With limit_all_gathers=True, you may see a gap in the FSDP pre-forward where the CPU thread is not issuing any kernels. This is intentional and shows the rate limiter in effect. Synchronizing the CPU thread in that way prevents over-allocating memory for subsequent all-gathers, and it should not actually delay GPU kernel execution.

FSDP replaces managed modules’ parameters with torch.Tensor views during forward and backward computation for autograd-related reasons. If your module’s forward relies on saved references to the parameters instead of reacquiring the references each iteration, then it will not see FSDP’s newly created views, and autograd will not work correctly.

Finally, when using sharding_strategy=ShardingStrategy.HYBRID_SHARD with the sharding process group being intra-node and the replication process group being inter-node, setting NCCL_CROSS_NIC=1 can help improve the all-reduce times over the replication process group for some cluster setups.

There are several limitations to be aware of when using FSDP:

FSDP currently does not support gradient accumulation outside no_sync() when using CPU offloading. This is because FSDP uses the newly-reduced gradient instead of accumulating with any existing gradient, which can lead to incorrect results.

FSDP does not support running the forward pass of a submodule that is contained in an FSDP instance. This is because the submodule’s parameters will be sharded, but the submodule itself is not an FSDP instance, so its forward pass will not all-gather the full parameters appropriately.

FSDP does not work with double backwards due to the way it registers backward hooks.

FSDP has some constraints when freezing parameters. For use_orig_params=False, each FSDP instance must manage parameters that are all frozen or all non-frozen. For use_orig_params=True, FSDP supports mixing frozen and non-frozen parameters, but it’s recommended to avoid doing so to prevent higher than expected gradient memory usage.

As of PyTorch 1.12, FSDP offers limited support for shared parameters. If enhanced shared parameter support is needed for your use case, please post in this issue.

You should avoid modifying the parameters between forward and backward without using the summon_full_params context, as the modifications may not persist.

module (nn.Module) – This is the module to be wrapped with FSDP.

process_group (Optional[Union[ProcessGroup, Tuple[ProcessGroup, ProcessGroup]]]) – This is the process group over which the model is sharded and thus the one used for FSDP’s all-gather and reduce-scatter collective communications. If None, then FSDP uses the default process group. For hybrid sharding strategies such as ShardingStrategy.HYBRID_SHARD, users can pass in a tuple of process groups, representing the groups over which to shard and replicate, respectively. If None, then FSDP constructs process groups for the user to shard intra-node and replicate inter-node. (Default: None)

sharding_strategy (Optional[ShardingStrategy]) – This configures the sharding strategy, which may trade off memory saving and communication overhead. See ShardingStrategy for details. (Default: FULL_SHARD)

cpu_offload (Optional[CPUOffload]) – This configures CPU offloading. If this is set to None, then no CPU offloading happens. See CPUOffload for details. (Default: None)

auto_wrap_policy (Optional[Union[Callable[[nn.Module, bool, int], bool], ModuleWrapPolicy, CustomPolicy]]) – This specifies a policy to apply FSDP to submodules of module, which is needed for communication and computation overlap and thus affects performance. If None, then FSDP only applies to module, and users should manually apply FSDP to parent modules themselves (proceeding bottom-up). For convenience, this accepts ModuleWrapPolicy directly, which allows users to specify the module classes to wrap (e.g. the transformer block). Otherwise, this should be a callable that takes in three arguments module: nn.Module, recurse: bool, and nonwrapped_numel: int and should return a bool specifying whether the passed-in module should have FSDP applied if recurse=False or if the traversal should continue into the module’s subtree if recurse=True. Users may add additional arguments to the callable. The size_based_auto_wrap_policy in torch.distributed.fsdp.wrap.py gives an example callable that applies FSDP to a module if the parameters in its subtree exceed 100M numel. We recommend printing the model after applying FSDP and adjusting as needed. Example: >>> def custom_auto_wrap_policy( >>> module: nn.Module, >>> recurse: bool, >>> nonwrapped_numel: int, >>> # Additional custom arguments >>> min_num_params: int = int(1e8), >>> ) -> bool: >>> return nonwrapped_numel >= min_num_params >>> # Configure a custom `min_num_params` >>> my_auto_wrap_policy = functools.partial(custom_auto_wrap_policy, min_num_params=int(1e5))

This specifies a policy to apply FSDP to submodules of module, which is needed for communication and computation overlap and thus affects performance. If None, then FSDP only applies to module, and users should manually apply FSDP to parent modules themselves (proceeding bottom-up). For convenience, this accepts ModuleWrapPolicy directly, which allows users to specify the module classes to wrap (e.g. the transformer block). Otherwise, this should be a callable that takes in three arguments module: nn.Module, recurse: bool, and nonwrapped_numel: int and should return a bool specifying whether the passed-in module should have FSDP applied if recurse=False or if the traversal should continue into the module’s subtree if recurse=True. Users may add additional arguments to the callable. The size_based_auto_wrap_policy in torch.distributed.fsdp.wrap.py gives an example callable that applies FSDP to a module if the parameters in its subtree exceed 100M numel. We recommend printing the model after applying FSDP and adjusting as needed.

backward_prefetch (Optional[BackwardPrefetch]) – This configures explicit backward prefetching of all-gathers. If None, then FSDP does not backward prefetch, and there is no communication and computation overlap in the backward pass. See BackwardPrefetch for details. (Default: BACKWARD_PRE)

mixed_precision (Optional[MixedPrecision]) – This configures native mixed precision for FSDP. If this is set to None, then no mixed precision is used. Otherwise, parameter, buffer, and gradient reduction dtypes can be set. See MixedPrecision for details. (Default: None)

ignored_modules (Optional[Iterable[torch.nn.Module]]) – Modules whose own parameters and child modules’ parameters and buffers are ignored by this instance. None of the modules directly in ignored_modules should be FullyShardedDataParallel instances, and any child modules that are already-constructed FullyShardedDataParallel instances will not be ignored if they are nested under this instance. This argument may be used to avoid sharding specific parameters at module granularity when using an auto_wrap_policy or if parameters’ sharding is not managed by FSDP. (Default: None)

param_init_fn (Optional[Callable[[nn.Module], None]]) – A Callable[torch.nn.Module] -> None that specifies how modules that are currently on the meta device should be initialized onto an actual device. As of v1.12, FSDP detects modules with parameters or buffers on meta device via is_meta and either applies param_init_fn if specified or calls nn.Module.reset_parameters() otherwise. For both cases, the implementation should only initialize the parameters/buffers of the module, not those of its submodules. This is to avoid re-initialization. In addition, FSDP also supports deferred initialization via torchdistX’s (pytorch/torchdistX) deferred_init() API, where the deferred modules are initialized by calling param_init_fn if specified or torchdistX’s default materialize_module() otherwise. If param_init_fn is specified, then it is applied to all meta-device modules, meaning that it should probably case on the module type. FSDP calls the initialization function before parameter flattening and sharding. Example: >>> module = MyModule(device="meta") >>> def my_init_fn(module: nn.Module): >>> # E.g. initialize depending on the module type >>> ... >>> fsdp_model = FSDP(module, param_init_fn=my_init_fn, auto_wrap_policy=size_based_auto_wrap_policy) >>> print(next(fsdp_model.parameters()).device) # current CUDA device >>> # With torchdistX >>> module = deferred_init.deferred_init(MyModule, device="cuda") >>> # Will initialize via deferred_init.materialize_module(). >>> fsdp_model = FSDP(module, auto_wrap_policy=size_based_auto_wrap_policy)

A Callable[torch.nn.Module] -> None that specifies how modules that are currently on the meta device should be initialized onto an actual device. As of v1.12, FSDP detects modules with parameters or buffers on meta device via is_meta and either applies param_init_fn if specified or calls nn.Module.reset_parameters() otherwise. For both cases, the implementation should only initialize the parameters/buffers of the module, not those of its submodules. This is to avoid re-initialization. In addition, FSDP also supports deferred initialization via torchdistX’s (pytorch/torchdistX) deferred_init() API, where the deferred modules are initialized by calling param_init_fn if specified or torchdistX’s default materialize_module() otherwise. If param_init_fn is specified, then it is applied to all meta-device modules, meaning that it should probably case on the module type. FSDP calls the initialization function before parameter flattening and sharding.

device_id (Optional[Union[int, torch.device]]) – An int or torch.device giving the CUDA device on which FSDP initialization takes place, including the module initialization if needed and the parameter sharding. This should be specified to improve initialization speed if module is on CPU. If the default CUDA device was set (e.g. via torch.cuda.set_device), then the user may pass torch.cuda.current_device to this. (Default: None)

sync_module_states (bool) – If True, then each FSDP module will broadcast module parameters and buffers from rank 0 to ensure that they are replicated across ranks (adding communication overhead to this constructor). This can help load state_dict checkpoints via load_state_dict in a memory efficient way. See FullStateDictConfig for an example of this. (Default: False)

forward_prefetch (bool) – If True, then FSDP explicitly prefetches the next forward-pass all-gather before the current forward computation. This is only useful for CPU-bound workloads, in which case issuing the next all-gather earlier may improve overlap. This should only be used for static-graph models since the prefetching follows the first iteration’s execution order. (Default: False)

limit_all_gathers (bool) – If True, then FSDP explicitly synchronizes the CPU thread to ensure GPU memory usage from only two consecutive FSDP instances (the current instance running computation and the next instance whose all-gather is prefetched). If False, then FSDP allows the CPU thread to issue all-gathers without any extra synchronization. (Default: True) We often refer to this feature as the “rate limiter”. This flag should only be set to False for specific CPU-bound workloads with low memory pressure in which case the CPU thread can aggressively issue all kernels without concern for the GPU memory usage.

use_orig_params (bool) – Setting this to True has FSDP use module ‘s original parameters. FSDP exposes those original parameters to the user via nn.Module.named_parameters() instead of FSDP’s internal FlatParameter s. This means that the optimizer step runs on the original parameters, enabling per-original-parameter hyperparameters. FSDP preserves the original parameter variables and manipulates their data between unsharded and sharded forms, where they are always views into the underlying unsharded or sharded FlatParameter, respectively. With the current algorithm, the sharded form is always 1D, losing the original tensor structure. An original parameter may have all, some, or none of its data present for a given rank. In the none case, its data will be like a size-0 empty tensor. Users should not author programs relying on what data is present for a given original parameter in its sharded form. True is required to use torch.compile(). Setting this to False exposes FSDP’s internal FlatParameter s to the user via nn.Module.named_parameters(). (Default: False)

ignored_states (Optional[Iterable[torch.nn.Parameter]], Optional[Iterable[torch.nn.Module]]) – Ignored parameters or modules that will not be managed by this FSDP instance, meaning that the parameters are not sharded and their gradients are not reduced across ranks. This argument unifies with the existing ignored_modules argument, and we may deprecate ignored_modules soon. For backward compatibility, we keep both ignored_states and ignored_modules`, but FSDP only allows one of them to be specified as not None.

device_mesh (Optional[DeviceMesh]) – DeviceMesh can be used as an alternative to process_group. When device_mesh is passed, FSDP will use the underlying process groups for all-gather and reduce-scatter collective communications. Therefore, these two args need to be mutually exclusive. For hybrid sharding strategies such as ShardingStrategy.HYBRID_SHARD, users can pass in a 2D DeviceMesh instead of a tuple of process groups. For 2D FSDP + TP, users are required to pass in device_mesh instead of process_group. For more DeviceMesh info, please visit: https://pytorch.org/tutorials/recipes/distributed_device_mesh.html

Apply fn recursively to every submodule (as returned by .children()) as well as self.

Typical use includes initializing the parameters of a model (see also torch.nn.init).

Compared to torch.nn.Module.apply, this version additionally gathers the full parameters before applying fn. It should not be called from within another summon_full_params context.

fn (Module -> None) – function to be applied to each submodule

Check if this instance is a root FSDP module.

Clip the gradient norm of all parameters.

The norm is computed over all parameters’ gradients as viewed as a single vector, and the gradients are modified in-place.

max_norm (float or int) – max norm of the gradients

norm_type (float or int) – type of the used p-norm. Can be 'inf' for infinity norm.

Total norm of the parameters (viewed as a single vector).

If every FSDP instance uses NO_SHARD, meaning that no gradients are sharded across ranks, then you may directly use torch.nn.utils.clip_grad_norm_().

If at least some FSDP instance uses a sharded strategy (i.e. one other than NO_SHARD), then you should use this method instead of torch.nn.utils.clip_grad_norm_() since this method handles the fact that gradients are sharded across ranks.

The total norm returned will have the “largest” dtype across all parameters/gradients as defined by PyTorch’s type promotion semantics. For example, if all parameters/gradients use a low precision dtype, then the returned norm’s dtype will be that low precision dtype, but if there exists at least one parameter/ gradient using FP32, then the returned norm’s dtype will be FP32.

This needs to be called on all ranks since it uses collective communications.

Flatten a sharded optimizer state-dict.

The API is similar to shard_full_optim_state_dict(). The only difference is that the input sharded_optim_state_dict should be returned from sharded_optim_state_dict(). Therefore, there will be all-gather calls on each rank to gather ShardedTensor s.

sharded_optim_state_dict (Dict[str, Any]) – Optimizer state dict corresponding to the unflattened parameters and holding the sharded optimizer state.

model (torch.nn.Module) – Refer to shard_full_optim_state_dict().

optim (torch.optim.Optimizer) – Optimizer for model ‘s parameters.

Refer to shard_full_optim_state_dict().

Run the forward pass for the wrapped module, inserting FSDP-specific pre- and post-forward sharding logic.

Return all nested FSDP instances.

This possibly includes module itself and only includes FSDP root modules if root_only=True.

module (torch.nn.Module) – Root module, which may or may not be an FSDP module.

root_only (bool) – Whether to return only FSDP root modules. (Default: False)

FSDP modules that are nested in the input module.

List[FullyShardedDataParallel]

Return the full optimizer state-dict.

Consolidates the full optimizer state on rank 0 and returns it as a dict following the convention of torch.optim.Optimizer.state_dict(), i.e. with keys "state" and "param_groups". The flattened parameters in FSDP modules contained in model are mapped back to their unflattened parameters.

This needs to be called on all ranks since it uses collective communications. However, if rank0_only=True, then the state dict is only populated on rank 0, and all other ranks return an empty dict.

Unlike torch.optim.Optimizer.state_dict(), this method uses full parameter names as keys instead of parameter IDs.

Like in torch.optim.Optimizer.state_dict(), the tensors contained in the optimizer state dict are not cloned, so there may be aliasing surprises. For best practices, consider saving the returned optimizer state dict immediately, e.g. using torch.save().

model (torch.nn.Module) – Root module (which may or may not be a FullyShardedDataParallel instance) whose parameters were passed into the optimizer optim.

optim (torch.optim.Optimizer) – Optimizer for model ‘s parameters.

optim_input (Optional[Union[List[Dict[str, Any]], Iterable[torch.nn.Parameter]]]) – Input passed into the optimizer optim representing either a list of parameter groups or an iterable of parameters; if None, then this method assumes the input was model.parameters(). This argument is deprecated, and there is no need to pass it in anymore. (Default: None)

rank0_only (bool) – If True, saves the populated dict only on rank 0; if False, saves it on all ranks. (Default: True)

group (dist.ProcessGroup) – Model’s process group or None if using the default process group. (Default: None)

A dict containing the optimizer state for model ‘s original unflattened parameters and including keys “state” and “param_groups” following the convention of torch.optim.Optimizer.state_dict(). If rank0_only=True, then nonzero ranks return an empty dict.

Get the state_dict_type and the corresponding configurations for the FSDP modules rooted at module.

The target module does not have to be an FSDP module.

A StateDictSettings containing the state_dict_type and state_dict / optim_state_dict configs that are currently set.

AssertionError` if the StateDictSettings for different –

FSDP submodules differ. –

Return the wrapped module.

Return an iterator over module buffers, yielding both the name of the buffer and the buffer itself.

Intercepts buffer names and removes all occurrences of the FSDP-specific flattened buffer prefix when inside the summon_full_params() context manager.

Iterator[tuple[str, torch.Tensor]]

Return an iterator over module parameters, yielding both the name of the parameter and the parameter itself.

Intercepts parameter names and removes all occurrences of the FSDP-specific flattened parameter prefix when inside the summon_full_params() context manager.

Iterator[tuple[str, torch.nn.parameter.Parameter]]

Disable gradient synchronizations across FSDP instances.

Within this context, gradients will be accumulated in module variables, which will later be synchronized in the first forward-backward pass after exiting the context. This should only be used on the root FSDP instance and will recursively apply to all children FSDP instances.

This likely results in higher memory usage because FSDP will accumulate the full model gradients (instead of gradient shards) until the eventual sync.

When used with CPU offloading, the gradients will not be offloaded to CPU when inside the context manager. Instead, they will only be offloaded right after the eventual sync.

Transform the state-dict of an optimizer corresponding to a sharded model.

The given state-dict can be transformed to one of three types: 1) full optimizer state_dict, 2) sharded optimizer state_dict, 3) local optimizer state_dict.

For full optimizer state_dict, all states are unflattened and not sharded. Rank0 only and CPU only can be specified via state_dict_type() to avoid OOM.

For sharded optimizer state_dict, all states are unflattened but sharded. CPU only can be specified via state_dict_type() to further save memory.

For local state_dict, no transformation will be performed. But a state will be converted from nn.Tensor to ShardedTensor to represent its sharding nature (this is not supported yet).

model (torch.nn.Module) – Root module (which may or may not be a FullyShardedDataParallel instance) whose parameters were passed into the optimizer optim.

optim (torch.optim.Optimizer) – Optimizer for model ‘s parameters.

optim_state_dict (Dict[str, Any]) – the target optimizer state_dict to transform. If the value is None, optim.state_dict() will be used. ( Default: None)

group (dist.ProcessGroup) – Model’s process group across which parameters are sharded or None if using the default process group. ( Default: None)

A dict containing the optimizer state for model. The sharding of the optimizer state is based on state_dict_type.

Convert an optimizer state-dict so that it can be loaded into the optimizer associated with the FSDP model.

Given a optim_state_dict that is transformed through optim_state_dict(), it gets converted to the flattened optimizer state_dict that can be loaded to optim which is the optimizer for model. model must be sharded by FullyShardedDataParallel.

model (torch.nn.Module) – Root module (which may or may not be a FullyShardedDataParallel instance) whose parameters were passed into the optimizer optim.

optim (torch.optim.Optimizer) – Optimizer for model ‘s parameters.

optim_state_dict (Dict[str, Any]) – The optimizer states to be loaded.

is_named_optimizer (bool) – Is this optimizer a NamedOptimizer or KeyedOptimizer. Only set to True if optim is TorchRec’s KeyedOptimizer or torch.distributed’s NamedOptimizer.

load_directly (bool) – If this is set to True, this API will also call optim.load_state_dict(result) before returning the result. Otherwise, users are responsible to call optim.load_state_dict() (Default: False)

group (dist.ProcessGroup) – Model’s process group across which parameters are sharded or None if using the default process group. ( Default: None)

Register a communication hook.

This is an enhancement that provides a flexible hook to users where they can specify how FSDP aggregates gradients across multiple workers. This hook can be used to implement several algorithms like GossipGrad and gradient compression which involve different communication strategies for parameter syncs while training with FullyShardedDataParallel.

FSDP communication hook should be registered before running an initial forward pass and only once.

state (object) – Passed to the hook to maintain any state information during the training process. Examples include error feedback in gradient compression, peers to communicate with next in GossipGrad, etc. It is locally stored by each worker and shared by all the gradient tensors on the worker.

Passed to the hook to maintain any state information during the training process. Examples include error feedback in gradient compression, peers to communicate with next in GossipGrad, etc. It is locally stored by each worker and shared by all the gradient tensors on the worker.

hook (Callable) – Callable, which has one of the following signatures: 1) hook: Callable[torch.Tensor] -> None: This function takes in a Python tensor, which represents the full, flattened, unsharded gradient with respect to all variables corresponding to the model this FSDP unit is wrapping (that are not wrapped by other FSDP sub-units). It then performs all necessary processing and returns None; 2) hook: Callable[torch.Tensor, torch.Tensor] -> None: This function takes in two Python tensors, the first one represents the full, flattened, unsharded gradient with respect to all variables corresponding to the model this FSDP unit is wrapping (that are not wrapped by other FSDP sub-units). The latter represents a pre-sized tensor to store a chunk of a sharded gradient after reduction. In both cases, callable performs all necessary processing and returns None. Callables with signature 1 are expected to handle gradient communication for a NO_SHARD case. Callables with signature 2 are expected to handle gradient communication for sharded cases.

Re-keys the optimizer state dict optim_state_dict to use the key type optim_state_key_type.

This can be used to achieve compatibility between optimizer state dicts from models with FSDP instances and ones without.

To re-key an FSDP full optimizer state dict (i.e. from full_optim_state_dict()) to use parameter IDs and be loadable to a non-wrapped model:

To re-key a normal optimizer state dict from a non-wrapped model to be loadable to a wrapped model:

The optimizer state dict re-keyed using the parameter keys specified by optim_state_key_type.

Scatter the full optimizer state dict from rank 0 to all other ranks.

Returns the sharded optimizer state dict on each rank. The return value is the same as shard_full_optim_state_dict(), and on rank 0, the first argument should be the return value of full_optim_state_dict().

Both shard_full_optim_state_dict() and scatter_full_optim_state_dict() may be used to get the sharded optimizer state dict to load. Assuming that the full optimizer state dict resides in CPU memory, the former requires each rank to have the full dict in CPU memory, where each rank individually shards the dict without any communication, while the latter requires only rank 0 to have the full dict in CPU memory, where rank 0 moves each shard to GPU memory (for NCCL) and communicates it to ranks appropriately. Hence, the former has higher aggregate CPU memory cost, while the latter has higher communication cost.

full_optim_state_dict (Optional[Dict[str, Any]]) – Optimizer state dict corresponding to the unflattened parameters and holding the full non-sharded optimizer state if on rank 0; the argument is ignored on nonzero ranks.

model (torch.nn.Module) – Root module (which may or may not be a FullyShardedDataParallel instance) whose parameters correspond to the optimizer state in full_optim_state_dict.

optim_input (Optional[Union[List[Dict[str, Any]], Iterable[torch.nn.Parameter]]]) – Input passed into the optimizer representing either a list of parameter groups or an iterable of parameters; if None, then this method assumes the input was model.parameters(). This argument is deprecated, and there is no need to pass it in anymore. (Default: None)

optim (Optional[torch.optim.Optimizer]) – Optimizer that will load the state dict returned by this method. This is the preferred argument to use over optim_input. (Default: None)

group (dist.ProcessGroup) – Model’s process group or None if using the default process group. (Default: None)

The full optimizer state dict now remapped to flattened parameters instead of unflattened parameters and restricted to only include this rank’s part of the optimizer state.

Set the state_dict_type of all the descendant FSDP modules of the target module.

Also takes (optional) configuration for the model’s and optimizer’s state dict. The target module does not have to be a FSDP module. If the target module is a FSDP module, its state_dict_type will also be changed.

This API should be called for only the top-level (root) module.

This API enables users to transparently use the conventional state_dict API to take model checkpoints in cases where the root FSDP module is wrapped by another nn.Module. For example, the following will ensure state_dict is called on all non-FSDP instances, while dispatching into sharded_state_dict implementation for FSDP:

module (torch.nn.Module) – Root module.

state_dict_type (StateDictType) – the desired state_dict_type to set.

state_dict_config (Optional[StateDictConfig]) – the configuration for the target state_dict_type.

optim_state_dict_config (Optional[OptimStateDictConfig]) – the configuration for the optimizer state dict.

A StateDictSettings that include the previous state_dict type and configuration for the module.

Shard a full optimizer state-dict.

Remaps the state in full_optim_state_dict to flattened parameters instead of unflattened parameters and restricts to only this rank’s part of the optimizer state. The first argument should be the return value of full_optim_state_dict().

Both shard_full_optim_state_dict() and scatter_full_optim_state_dict() may be used to get the sharded optimizer state dict to load. Assuming that the full optimizer state dict resides in CPU memory, the former requires each rank to have the full dict in CPU memory, where each rank individually shards the dict without any communication, while the latter requires only rank 0 to have the full dict in CPU memory, where rank 0 moves each shard to GPU memory (for NCCL) and communicates it to ranks appropriately. Hence, the former has higher aggregate CPU memory cost, while the latter has higher communication cost.

full_optim_state_dict (Dict[str, Any]) – Optimizer state dict corresponding to the unflattened parameters and holding the full non-sharded optimizer state.

model (torch.nn.Module) – Root module (which may or may not be a FullyShardedDataParallel instance) whose parameters correspond to the optimizer state in full_optim_state_dict.

optim_input (Optional[Union[List[Dict[str, Any]], Iterable[torch.nn.Parameter]]]) – Input passed into the optimizer representing either a list of parameter groups or an iterable of parameters; if None, then this method assumes the input was model.parameters(). This argument is deprecated, and there is no need to pass it in anymore. (Default: None)

optim (Optional[torch.optim.Optimizer]) – Optimizer that will load the state dict returned by this method. This is the preferred argument to use over optim_input. (Default: None)

The full optimizer state dict now remapped to flattened parameters instead of unflattened parameters and restricted to only include this rank’s part of the optimizer state.

Return the optimizer state-dict in its sharded form.

The API is similar to full_optim_state_dict() but this API chunks all non-zero-dimension states to ShardedTensor to save memory. This API should only be used when the model state_dict is derived with the context manager with state_dict_type(SHARDED_STATE_DICT):.

For the detailed usage, refer to full_optim_state_dict().

The returned state dict contains ShardedTensor and cannot be directly used by the regular optim.load_state_dict.

Set the state_dict_type of all the descendant FSDP modules of the target module.

This context manager has the same functions as set_state_dict_type(). Read the document of set_state_dict_type() for the detail.

module (torch.nn.Module) – Root module.

state_dict_type (StateDictType) – the desired state_dict_type to set.

state_dict_config (Optional[StateDictConfig]) – the model state_dict configuration for the target state_dict_type.

optim_state_dict_config (Optional[OptimStateDictConfig]) – the optimizer state_dict configuration for the target state_dict_type.

Expose full params for FSDP instances with this context manager.

Can be useful after forward/backward for a model to get the params for additional processing or checking. It can take a non-FSDP module and will summon full params for all contained FSDP modules as well as their children, depending on the recurse argument.

This can be used on inner FSDPs.

This can not be used within a forward or backward pass. Nor can forward and backward be started from within this context.

Parameters will revert to their local shards after the context manager exits, storage behavior is the same as forward.

The full parameters can be modified, but only the portion corresponding to the local param shard will persist after the context manager exits (unless writeback=False, in which case changes will be discarded). In the case where FSDP does not shard the parameters, currently only when world_size == 1, or NO_SHARD config, the modification is persisted regardless of writeback.

This method works on modules which are not FSDP themselves but may contain multiple independent FSDP units. In that case, the given arguments will apply to all contained FSDP units.

Note that rank0_only=True in conjunction with writeback=True is not currently supported and will raise an error. This is because model parameter shapes would be different across ranks within the context, and writing to them can lead to inconsistency across ranks when the context is exited.

Note that offload_to_cpu and rank0_only=False will result in full parameters being redundantly copied to CPU memory for GPUs that reside on the same machine, which may incur the risk of CPU OOM. It is recommended to use offload_to_cpu with rank0_only=True.

recurse (bool, Optional) – recursively summon all params for nested FSDP instances (default: True).

writeback (bool, Optional) – if False, modifications to params are discarded after the context manager exits; disabling this can be slightly more efficient (default: True)

rank0_only (bool, Optional) – if True, full parameters are materialized on only global rank 0. This means that within the context, only rank 0 will have full parameters and the other ranks will have sharded parameters. Note that setting rank0_only=True with writeback=True is not supported, as model parameter shapes will be different across ranks within the context, and writing to them can lead to inconsistency across ranks when the context is exited.

offload_to_cpu (bool, Optional) – If True, full parameters are offloaded to CPU. Note that this offloading currently only occurs if the parameter is sharded (which is only not the case for world_size = 1 or NO_SHARD config). It is recommended to use offload_to_cpu with rank0_only=True to avoid redundant copies of model parameters being offloaded to the same CPU memory.

with_grads (bool, Optional) – If True, gradients are also unsharded with the parameters. Currently, this is only supported when passing use_orig_params=True to the FSDP constructor and offload_to_cpu=False to this method. (Default: False)

This configures explicit backward prefetching, which improves throughput by enabling communication and computation overlap in the backward pass at the cost of slightly increased memory usage.

BACKWARD_PRE: This enables the most overlap but increases memory usage the most. This prefetches the next set of parameters before the current set of parameters’ gradient computation. This overlaps the next all-gather and the current gradient computation, and at the peak, it holds the current set of parameters, next set of parameters, and current set of gradients in memory.

BACKWARD_POST: This enables less overlap but requires less memory usage. This prefetches the next set of parameters after the current set of parameters’ gradient computation. This overlaps the current reduce-scatter and the next gradient computation, and it frees the current set of parameters before allocating memory for the next set of parameters, only holding the next set of parameters and current set of gradients in memory at the peak.

FSDP’s backward_prefetch argument accepts None, which disables the backward prefetching altogether. This has no overlap and does not increase memory usage. In general, we do not recommend this setting since it may degrade throughput significantly.

For more technical context: For a single process group using NCCL backend, any collectives, even if issued from different streams, contend for the same per-device NCCL stream, which implies that the relative order in which the collectives are issued matters for overlapping. The two backward prefetching values correspond to different issue orders.

This specifies the sharding strategy to be used for distributed training by FullyShardedDataParallel.

FULL_SHARD: Parameters, gradients, and optimizer states are sharded. For the parameters, this strategy unshards (via all-gather) before the forward, reshards after the forward, unshards before the backward computation, and reshards after the backward computation. For gradients, it synchronizes and shards them (via reduce-scatter) after the backward computation. The sharded optimizer states are updated locally per rank.

SHARD_GRAD_OP: Gradients and optimizer states are sharded during computation, and additionally, parameters are sharded outside computation. For the parameters, this strategy unshards before the forward, does not reshard them after the forward, and only reshards them after the backward computation. The sharded optimizer states are updated locally per rank. Inside no_sync(), the parameters are not resharded after the backward computation.

NO_SHARD: Parameters, gradients, and optimizer states are not sharded but instead replicated across ranks similar to PyTorch’s DistributedDataParallel API. For gradients, this strategy synchronizes them (via all-reduce) after the backward computation. The unsharded optimizer states are updated locally per rank.

HYBRID_SHARD: Apply FULL_SHARD within a node, and replicate parameters across nodes. This results in reduced communication volume as expensive all-gathers and reduce-scatters are only done within a node, which can be more performant for medium -sized models.

_HYBRID_SHARD_ZERO2: Apply SHARD_GRAD_OP within a node, and replicate parameters across nodes. This is like HYBRID_SHARD, except this may provide even higher throughput since the unsharded parameters are not freed after the forward pass, saving the all-gathers in the pre-backward.

This configures FSDP-native mixed precision training.

param_dtype (Optional[torch.dtype]) – This specifies the dtype for model parameters during forward and backward and thus the dtype for forward and backward computation. Outside forward and backward, the sharded parameters are kept in full precision (e.g. for the optimizer step), and for model checkpointing, the parameters are always saved in full precision. (Default: None)

reduce_dtype (Optional[torch.dtype]) – This specifies the dtype for gradient reduction (i.e. reduce-scatter or all-reduce). If this is None but param_dtype is not None, then this takes on the param_dtype value, still running gradient reduction in low precision. This is permitted to differ from param_dtype, e.g. to force gradient reduction to run in full precision. (Default: None)

buffer_dtype (Optional[torch.dtype]) – This specifies the dtype for buffers. FSDP does not shard buffers. Rather, FSDP casts them to buffer_dtype in the first forward pass and keeps them in that dtype thereafter. For model checkpointing, the buffers are saved in full precision except for LOCAL_STATE_DICT. (Default: None)

keep_low_precision_grads (bool) – If False, then FSDP upcasts gradients to full precision after the backward pass in preparation for the optimizer step. If True, then FSDP keeps the gradients in the dtype used for gradient reduction, which can save memory if using a custom optimizer that supports running in low precision. (Default: False)

cast_forward_inputs (bool) – If True, then this FSDP module casts its forward args and kwargs to param_dtype. This is to ensure that parameter and input dtypes match for forward computation, as required by many ops. This may need to be set to True when only applying mixed precision to some but not all FSDP modules, in which case a mixed-precision FSDP submodule needs to recast its inputs. (Default: False)

cast_root_forward_inputs (bool) – If True, then the root FSDP module casts its forward args and kwargs to param_dtype, overriding the value of cast_forward_inputs. For non-root FSDP modules, this does not do anything. (Default: True)

_module_classes_to_ignore (collections.abc.Sequence[type[torch.nn.modules.module.Module]]) – (Sequence[Type[nn.Module]]): This specifies module classes to ignore for mixed precision when using an auto_wrap_policy: Modules of these classes will have FSDP applied to them separately with mixed precision disabled (meaning that the final FSDP construction would deviate from the specified policy). If auto_wrap_policy is not specified, then this does not do anything. This API is experimental and subject to change. (Default: (_BatchNorm,))

This API is experimental and subject to change.

Only floating point tensors are cast to their specified dtypes.

In summon_full_params, parameters are forced to full precision, but buffers are not.

Layer norm and batch norm accumulate in float32 even when their inputs are in a low precision like float16 or bfloat16. Disabling FSDP’s mixed precision for those norm modules only means that the affine parameters are kept in float32. However, this incurs separate all-gathers and reduce-scatters for those norm modules, which may be inefficient, so if the workload permits, the user should prefer to still apply mixed precision to those modules.

By default, if the user passes a model with any _BatchNorm modules and specifies an auto_wrap_policy, then the batch norm modules will have FSDP applied to them separately with mixed precision disabled. See the _module_classes_to_ignore argument.

MixedPrecision has cast_root_forward_inputs=True and cast_forward_inputs=False by default. For the root FSDP instance, its cast_root_forward_inputs takes precedence over its cast_forward_inputs. For non-root FSDP instances, their cast_root_forward_inputs values are ignored. The default setting is sufficient for the typical case where each FSDP instance has the same MixedPrecision configuration and only needs to cast inputs to the param_dtype at the beginning of the model’s forward pass.

For nested FSDP instances with different MixedPrecision configurations, we recommend setting individual cast_forward_inputs values to configure casting inputs or not before each instance’s forward. In such a case, since the casts happen before each FSDP instance’s forward, a parent FSDP instance should have its non-FSDP submodules run before its FSDP submodules to avoid the activation dtype being changed due to a different MixedPrecision configuration.

The above shows a working example. On the other hand, if model[1] were replaced with model[0], meaning that the submodule using different MixedPrecision ran its forward first, then model[1] would incorrectly see float16 activations instead of bfloat16 ones.

This configures CPU offloading.

offload_params (bool) – This specifies whether to offload parameters to CPU when not involved in computation. If True, then this offloads gradients to CPU as well, meaning that the optimizer step runs on CPU.

StateDictConfig is the base class for all state_dict configuration classes. Users should instantiate a child class (e.g. FullStateDictConfig) in order to configure settings for the corresponding state_dict type supported by FSDP.

offload_to_cpu (bool) – If True, then FSDP offloads the state dict values to CPU, and if False, then FSDP keeps them on GPU. (Default: False)

FullStateDictConfig is a config class meant to be used with StateDictType.FULL_STATE_DICT. We recommend enabling both offload_to_cpu=True and rank0_only=True when saving full state dicts to save GPU memory and CPU memory, respectively. This config class is meant to be used via the state_dict_type() context manager as follows:

rank0_only (bool) – If True, then only rank 0 saves the full state dict, and nonzero ranks save an empty dict. If False, then all ranks save the full state dict. (Default: False)

ShardedStateDictConfig is a config class meant to be used with StateDictType.SHARDED_STATE_DICT.

_use_dtensor (bool) – If True, then FSDP saves the state dict values as DTensor, and if False, then FSDP saves them as ShardedTensor. (Default: False)

_use_dtensor is a private field of ShardedStateDictConfig and it is used by FSDP to determine the type of state dict values. Users should not manually modify _use_dtensor.

OptimStateDictConfig is the base class for all optim_state_dict configuration classes. Users should instantiate a child class (e.g. FullOptimStateDictConfig) in order to configure settings for the corresponding optim_state_dict type supported by FSDP.

offload_to_cpu (bool) – If True, then FSDP offloads the state dict’s tensor values to CPU, and if False, then FSDP keeps them on the original device (which is GPU unless parameter CPU offloading is enabled). (Default: True)

rank0_only (bool) – If True, then only rank 0 saves the full state dict, and nonzero ranks save an empty dict. If False, then all ranks save the full state dict. (Default: False)

ShardedOptimStateDictConfig is a config class meant to be used with StateDictType.SHARDED_STATE_DICT.

_use_dtensor (bool) – If True, then FSDP saves the state dict values as DTensor, and if False, then FSDP saves them as ShardedTensor. (Default: False)

_use_dtensor is a private field of ShardedOptimStateDictConfig and it is used by FSDP to determine the type of state dict values. Users should not manually modify _use_dtensor.

---

## Distributed Optimizers#

**URL:** https://pytorch.org/docs/stable/distributed.optim.html

**Contents:**
- Distributed Optimizers#

Created On: Mar 01, 2021 | Last Updated On: Jun 16, 2025

Distributed optimizer is not currently supported when using CUDA tensors

torch.distributed.optim exposes DistributedOptimizer, which takes a list of remote parameters (RRef) and runs the optimizer locally on the workers where the parameters live. The distributed optimizer can use any of the local optimizer Base class to apply the gradients on each worker.

DistributedOptimizer takes remote references to parameters scattered across workers and applies the given optimizer locally for each parameter.

This class uses get_gradients() in order to retrieve the gradients for specific parameters.

Concurrent calls to step(), either from the same or different clients, will be serialized on each worker – as each worker’s optimizer can only work on one set of gradients at a time. However, there is no guarantee that the full forward-backward-optimizer sequence will execute for one client at a time. This means that the gradients being applied may not correspond to the latest forward pass executed on a given worker. Also, there is no guaranteed ordering across workers.

DistributedOptimizer creates the local optimizer with TorchScript enabled by default, so that optimizer updates are not blocked by the Python Global Interpreter Lock (GIL) in the case of multithreaded training (e.g. Distributed Model Parallel). This feature is currently enabled for most optimizers. You can also follow the recipe in PyTorch tutorials to enable TorchScript support for your own custom optimizers.

optimizer_class (optim.Optimizer) – the class of optimizer to instantiate on each worker.

params_rref (list[RRef]) – list of RRefs to local or remote parameters to optimize.

args – arguments to pass to the optimizer constructor on each worker.

kwargs – arguments to pass to the optimizer constructor on each worker.

Performs a single optimization step.

This will call torch.optim.Optimizer.step() on each worker containing parameters to be optimized, and will block until all workers return. The provided context_id will be used to retrieve the corresponding context that contains the gradients that should be applied to the parameters.

context_id – the autograd context id for which we should run the optimizer step.

Wraps an arbitrary torch.optim.Optimizer and runs post-local SGD, This optimizer runs local optimizer at every step. After the warm-up stage, it averages parameters periodically after the local optimizer is applied.

optim (Optimizer) – The local optimizer.

averager (ModelAverager) – A model averager instance to run post-localSGD algorithm.

This is the same as torch.optim.Optimizer load_state_dict(), but also restores model averager’s step value to the one saved in the provided state_dict.

If there is no "step" entry in state_dict, it will raise a warning and initialize the model averager’s step to 0.

This is the same as torch.optim.Optimizer state_dict(), but adds an extra entry to record model averager’s step to the checkpoint to ensure reload does not cause unnecessary warm up again.

Performs a single optimization step (parameter update).

Wrap an arbitrary optim.Optimizer and shards its states across ranks in the group.

The sharing is done as described by ZeRO.

The local optimizer instance in each rank is only responsible for updating approximately 1 / world_size parameters and hence only needs to keep 1 / world_size optimizer states. After parameters are updated locally, each rank will broadcast its parameters to all other peers to keep all model replicas in the same state. ZeroRedundancyOptimizer can be used in conjunction with torch.nn.parallel.DistributedDataParallel to reduce per-rank peak memory consumption.

ZeroRedundancyOptimizer uses a sorted-greedy algorithm to pack a number of parameters at each rank. Each parameter belongs to a single rank and is not divided among ranks. The partition is arbitrary and might not match the parameter registration or usage order.

params (Iterable) – an Iterable of torch.Tensor s or dict s giving all parameters, which will be sharded across ranks.

optimizer_class (torch.nn.Optimizer) – the class of the local optimizer.

process_group (ProcessGroup, optional) – torch.distributed ProcessGroup (default: dist.group.WORLD initialized by torch.distributed.init_process_group()).

parameters_as_bucket_view (bool, optional) – if True, parameters are packed into buckets to speed up communication, and param.data fields point to bucket views at different offsets; if False, each individual parameter is communicated separately, and each params.data stays intact (default: False).

overlap_with_ddp (bool, optional) – if True, step() is overlapped with DistributedDataParallel ‘s gradient synchronization; this requires (1) either a functional optimizer for the optimizer_class argument or one with a functional equivalent and (2) registering a DDP communication hook constructed from one of the functions in ddp_zero_hook.py; parameters are packed into buckets matching those in DistributedDataParallel, meaning that the parameters_as_bucket_view argument is ignored. If False, step() runs disjointly after the backward pass (per normal). (default: False)

**defaults – any trailing arguments, which are forwarded to the local optimizer.

Currently, ZeroRedundancyOptimizer requires that all of the passed-in parameters are the same dense type.

If you pass overlap_with_ddp=True, be wary of the following: Given the way that overlapping DistributedDataParallel with ZeroRedundancyOptimizer is currently implemented, the first two or three training iterations do not perform parameter updates in the optimizer step, depending on if static_graph=False or static_graph=True, respectively. This is because it needs information about the gradient bucketing strategy used by DistributedDataParallel, which is not finalized until the second forward pass if static_graph=False or until the third forward pass if static_graph=True. To adjust for this, one option is to prepend dummy inputs.

ZeroRedundancyOptimizer is experimental and subject to change.

Add a parameter group to the Optimizer ‘s param_groups.

This can be useful when fine tuning a pre-trained network, as frozen layers can be made trainable and added to the Optimizer as training progresses.

param_group (dict) – specifies the parameters to be optimized and group-specific optimization options.

This method handles updating the shards on all partitions but needs to be called on all ranks. Calling this on a subset of the ranks will cause the training to hang because communication primitives are called depending on the managed parameters and expect all the ranks to participate on the same set of parameters.

Consolidate a list of state_dict s (one per rank) on the target rank.

to (int) – the rank that receives the optimizer states (default: 0).

RuntimeError – if overlap_with_ddp=True and this method is called before this ZeroRedundancyOptimizer instance has been fully initialized, which happens once DistributedDataParallel gradient buckets have been rebuilt.

This needs to be called on all ranks.

Return default device.

Return the ZeRO join hook.

It enables training on uneven inputs by shadowing the collective communications in the optimizer step.

Gradients must be properly set before this hook is called.

kwargs (dict) – a dict containing any keyword arguments to modify the behavior of the join hook at run time; all Joinable instances sharing the same join context manager are forwarded the same value for kwargs.

This hook does not support any keyword arguments; i.e. kwargs is unused.

Return process group.

Load the state pertaining to the given rank from the input state_dict, updating the local optimizer as needed.

state_dict (dict) – optimizer state; should be an object returned from a call to state_dict().

RuntimeError – if overlap_with_ddp=True and this method is called before this ZeroRedundancyOptimizer instance has been fully initialized, which happens once DistributedDataParallel gradient buckets have been rebuilt.

Return the last global optimizer state known to this rank.

RuntimeError – if overlap_with_ddp=True and this method is called before this ZeroRedundancyOptimizer instance has been fully initialized, which happens once DistributedDataParallel gradient buckets have been rebuilt; or if this method is called without a preceding call to consolidate_state_dict().

Perform a single optimizer step and syncs parameters across all ranks.

closure (Callable) – a closure that re-evaluates the model and returns the loss; optional for most optimizers.

Optional loss depending on the underlying local optimizer.

Any extra parameters are passed to the base optimizer as-is.

---

## Torch Distributed Elastic#

**URL:** https://pytorch.org/docs/stable/distributed.elastic.html

**Contents:**
- Torch Distributed Elastic#
- Get Started#
- Documentation#

Created On: Jun 16, 2025 | Last Updated On: Jul 25, 2025

Makes distributed PyTorch fault-tolerant and elastic.

---

## Pipeline Parallelism#

**URL:** https://pytorch.org/docs/stable/distributed.pipelining.html

**Contents:**
- Pipeline Parallelism#
- Why Pipeline Parallel?#
- What is torch.distributed.pipelining?#
- Step 1: build PipelineStage#
- Step 2: use PipelineSchedule for execution#
- Options for Splitting a Model#
  - Option 1: splitting a model manually#
  - Option 2: splitting a model automatically#
- Hugging Face Examples#
- Technical Deep Dive#

Created On: Jun 16, 2025 | Last Updated On: Aug 13, 2025

torch.distributed.pipelining is currently in alpha state and under development. API changes may be possible. It was migrated from the PiPPy project.

Pipeline Parallelism is one of the primitive parallelism for deep learning. It allows the execution of a model to be partitioned such that multiple micro-batches can execute different parts of the model code concurrently. Pipeline parallelism can be an effective technique for:

bandwidth-limited clusters

large model inference

The above scenarios share a commonality that the computation per device cannot hide the communication of conventional parallelism, for example, the weight all-gather of FSDP.

While promising for scaling, pipelining is often difficult to implement because it needs to partition the execution of a model in addition to model weights. The partitioning of execution often requires intrusive code changes to your model. Another aspect of complexity comes from scheduling micro-batches in a distributed environment, with data flow dependency considered.

The pipelining package provides a toolkit that does said things automatically which allows easy implementation of pipeline parallelism on general models.

It consists of two parts: a splitting frontend and a distributed runtime. The splitting frontend takes your model code as-is, splits it up into “model partitions”, and captures the data-flow relationship. The distributed runtime executes the pipeline stages on different devices in parallel, handling things like micro-batch splitting, scheduling, communication, and gradient propagation, etc.

Overall, the pipelining package provides the following features:

Splitting of model code based on simple specification.

Rich support for pipeline schedules, including GPipe, 1F1B, Interleaved 1F1B and Looped BFS, and providing the infrastructure for writing customized schedules.

First-class support for cross-host pipeline parallelism, as this is where PP is typically used (over slower interconnects).

Composability with other PyTorch parallel techniques such as data parallel (DDP, FSDP) or tensor parallel. The TorchTitan project demonstrates a “3D parallel” application on the Llama model.

Before we can use a PipelineSchedule, we need to create PipelineStage objects that wrap the part of the model running in that stage. The PipelineStage is responsible for allocating communication buffers and creating send/recv ops to communicate with its peers. It manages intermediate buffers e.g. for the outputs of forward that have not been consumed yet, and it provides a utility for running the backwards for the stage model.

A PipelineStage needs to know the input and output shapes for the stage model, so that it can correctly allocate communication buffers. The shapes must be static, e.g. at runtime the shapes can not change from step to step. A class PipeliningShapeError will be raised if runtime shapes do not match the expected shapes. When composing with other paralleisms or applying mixed precision, these techniques must be taken into account so the PipelineStage knows the correct shape (and dtype) for the output of the stage module at runtime.

Users may construct a PipelineStage instance directly, by passing in an nn.Module representing the portion of the model that should run on the stage. This may require changes to the original model code. See the example in Option 1: splitting a model manually.

Alternatively, the splitting frontend can use graph partitioning to split your model into a series of nn.Module automatically. This technique requires the model is traceable with torch.Export. Composability of the resulting nn.Module with other parallelism techniques is experimental, and may require some workarounds. Usage of this frontend may be more appealing if the user cannot easily change the model code. See Option 2: splitting a model automatically for more information.

We can now attach the PipelineStage to a pipeline schedule, and run the schedule with input data. Here is a GPipe example:

Note that the above code needs to be launched for each worker, thus we use a launcher service to launch multiple processes:

To directly construct a PipelineStage, the user is responsible for providing a single nn.Module instance that owns the relevant nn.Parameters and nn.Buffers, and defines a forward() method that executes the operations relevant for that stage. For example, a condensed version of the Transformer class defined in Torchtitan shows a pattern of building an easily partitionable model.

A model defined in this manner can be easily configured per stage by first initializing the whole model (using meta-device to avoid OOM errors), deleting undesired layers for that stage, and then creating a PipelineStage that wraps the model. For example:

When composing with other Data or Model parallelism techniques, output_args may also be required, if the output shape/dtype of the model chunk will be affected.

If you have a full model and do not want to spend time on modifying it into a sequence of “model partitions”, the pipeline API is here to help. Here is a brief example:

If we print the model, we can see multiple hierarchies, which makes it hard to split by hand:

Let us see how the pipeline API works:

The pipeline API splits your model given a split_spec, where SplitPoint.BEGINNING stands for adding a split point before execution of certain submodule in the forward function, and similarly, SplitPoint.END for split point after such.

If we print(pipe), we can see:

The “model partitions” are represented by submodules (submod_0, submod_1), each of which is reconstructed with original model operations, weights and hierarchies. In addition, a “root-level” forward function is reconstructed to capture the data flow between those partitions. Such data flow will be replayed by the pipeline runtime later, in a distributed fashion.

The Pipe object provides a method for retrieving the “model partitions”:

The returned stage_mod is a nn.Module, with which you can create an optimizer, save or load checkpoints, or apply other parallelisms.

Pipe also allows you to create a distributed stage runtime on a device given a ProcessGroup:

Alternatively, if you would like to build the stage runtime later after some modification to the stage_mod, you can use a functional version of the build_stage API. For example:

The pipeline frontend uses a tracer (torch.export) to capture your model into a single graph. If your model is not full-graph’able, you can use our manual frontend below.

In the PiPPy repo where this package was original created, we kept examples based on unmodified Hugging Face models. See the examples/huggingface directory.

First, the pipeline API turns our model into a directed acyclic graph (DAG) by tracing the model. It traces the model using torch.export – a PyTorch 2 full-graph capturing tool.

Then, it groups together the operations and parameters needed by a stage into a reconstructed submodule: submod_0, submod_1, …

Different from conventional submodule access methods like Module.children(), the pipeline API does not only cut the module structure of your model, but also the forward function of your model.

This is necessary because model structure like Module.children() merely captures information during Module.__init__(), and does not capture any information about Module.forward(). Said differently, Module.children() lacks information about the following aspects key to pipelininig:

Execution order of child modules in forward

Activation flows between child modules

Whether there are any functional operators between child modules (for example, relu or add operations will not be captured by Module.children()).

The pipeline API, on the contrary, makes sure that the forward behavior is truly preserved. It also captures the activation flow between the partitions, helping the distributed runtime to make correct send/receive calls without human intervention.

Another flexibility of the pipeline API is that split points can be at arbitrary levels within your model hierarchy. In the split partitions, the original model hierarchy related to that partition will be reconstructed at no cost to you. At a result, fully-qualified names (FQNs) pointing to a submodule or parameter would be still valid, and services that relies on FQNs (such as FSDP, TP or checkpointing) can still run with your partitioned modules with almost zero code change.

You can implement your own pipeline schedule by extending one of the following two class:

PipelineScheduleSingle

PipelineScheduleMulti

PipelineScheduleSingle is for schedules that assigns only one stage per rank. PipelineScheduleMulti is for schedules that assigns multiple stages per rank.

For example, ScheduleGPipe and Schedule1F1B are subclasses of PipelineScheduleSingle. Whereas, ScheduleInterleaved1F1B, ScheduleLoopedBFS, ScheduleInterleavedZeroBubble, and ScheduleZBVZeroBubble are subclasses of PipelineScheduleMulti.

You can turn on additional logging using the TORCH_LOGS environment variable from torch._logging:

TORCH_LOGS=+pp will display logging.DEBUG messages and all levels above it.

TORCH_LOGS=pp will display logging.INFO messages and above.

TORCH_LOGS=-pp will display logging.WARNING messages and above.

The following set of APIs transform your model into a pipeline representation.

Enum representing the points at which a split can occur in the execution of a submodule. :ivar BEGINNING: Represents adding a split point before the execution of a certain submodule in the forward function. :ivar END: Represents adding a split point after the execution of a certain submodule in the forward function.

Split a module based on a specification.

See Pipe for more details.

module (Module) – The module to be split.

mb_args (tuple[Any, ...]) – Example positional inputs, in micro-batch form.

mb_kwargs (Optional[dict[str, Any]]) – Example keyword inputs, in micro-batch form. (default: None)

split_spec (Optional[dict[str, torch.distributed.pipelining._IR.SplitPoint]]) – A dictionary using submodule names as split marker. (default: None)

split_policy (Optional[Callable[[GraphModule], GraphModule]]) – The policy to use for splitting the module. (default: None)

A pipeline representation of class Pipe.

pipe_split is a special operator that is used to mark the boundary between stages in a module. It is used to split the module into stages. It is a no-op if your annotated module is run eagerly.

The above example will be split into two stages.

Class used to specify chunking of inputs

Given a sequence of args and kwargs, split them into a number of chunks according to their respective chunking specs.

args (tuple[Any, ...]) – Tuple of args

kwargs (Optional[dict[str, Any]]) – Dict of kwargs

chunks (int) – Number of chunks to split the args and kwargs into

args_chunk_spec (Optional[tuple[torch.distributed.pipelining.microbatch.TensorChunkSpec, ...]]) – chunking specs for args, in same shape as args

kwargs_chunk_spec (Optional[dict[str, torch.distributed.pipelining.microbatch.TensorChunkSpec]]) – chunking specs for kwargs, in same shape as kwargs

List of sharded args kwargs_split: List of sharded kwargs

Given a list of chunks, merge them into a single value according to the chunk spec.

chunks (list[Any]) – list of chunks

chunk_spec – Chunking spec for the chunks

A class representing a pipeline stage in a pipeline parallelism setup.

PipelineStage assumes sequential partitioning of the model, i.e. the model is split into chunks where outputs from one chunk feed into inputs of the next chunk, with no skip connections.

PipelineStage performs runtime shape/dtype inference automatically by propagating the outputs from stage0 to stage1 and so forth, in linear order. To bypass shape inference, pass the input_args and output_args to each PipelineStage instance.

submodule (nn.Module) – The PyTorch module wrapped by this stage.

stage_index (int) – The ID of this stage.

num_stages (int) – The total number of stages.

device (torch.device) – The device where this stage is located.

input_args (Union[torch.Tensor, Tuple[torch.tensor]], optional) – The input arguments for the submodule.

output_args (Union[torch.Tensor, Tuple[torch.tensor]], optional) – The output arguments for the submodule.

group (dist.ProcessGroup, optional) – The process group for distributed training. If None, default group.

dw_builder (Optional[Callable[[], Callable[..., None]]) – If provided, dw_builder will build a new dw_runner function that will the W action (input weights) for F, I, W (Fwd, Input, Weight) zero bubble schedules.

Create a pipeline stage given a stage_module to be wrapped by this stage and pipeline information.

stage_module (torch.nn.Module) – the module to be wrapped by this stage

stage_index (int) – the index of this stage in the pipeline

pipe_info (PipeInfo) – information about the pipeline, can be retrieved by pipe.info()

device (torch.device) – the device to be used by this stage

group (Optional[dist.ProcessGroup]) – the process group to be used by this stage

a pipeline stage that can run with PipelineSchedules.

The GPipe schedule. Will go through all the microbatches in a fill-drain manner.

The 1F1B schedule. Will perform one forward and one backward on the microbatches in steady state.

The Interleaved 1F1B schedule. See https://arxiv.org/pdf/2104.04473 for details. Will perform one forward and one backward on the microbatches in steady state and supports multiple stages per rank. When microbatches are ready for multiple local stages, Interleaved 1F1B prioritizes the earlier microbatch (also called “depth first”).

This schedule is mostly similar to the original paper. It differs by being relaxing the requirement of num_microbatch % pp_size == 0. Using the flex_pp schedule, we will have num_rounds = max(1, n_microbatches // pp_group_size) and it works as long as n_microbatches % num_rounds is 0. As a few examples, support

pp_group_size = 4, n_microbatches = 10. We will have num_rounds = 2 and n_microbatches % 2 is 0.

pp_group_size = 4, n_microbatches = 3. We will have num_rounds = 1 and n_microbatches % 1 is 0.

Breadth-First Pipeline Parallelism. See https://arxiv.org/abs/2211.05953 for details. Similar to Interleaved 1F1B, Looped BFS supports multiple stages per rank. What is different is that when microbatches are ready for multiple local stages, Loops BFS will prioritizes the earlier stage, running all available microbatches at once.

The Interleaved Zero Bubble schedule. See https://arxiv.org/pdf/2401.10241 for details. Will perform one forward and one backward on inputs for the microbatches in steady state and supports multiple stages per rank. Uses the backward for weights to fill in the pipeline bubble.

In particular this is implementing the ZB1P schedule in the paper.

The Zero Bubble schedule (ZBV variant). See https://arxiv.org/pdf/2401.10241 Section 6 for details.

This schedules requires exactly two stages per rank.

This schedule will perform one forward and one backward on inputs for the microbatches in steady state and supports multiple stages per rank. Uses backward with respect to weights to fill in the pipeline bubble.

This ZB-V schedule would have the “zero bubble” property only if time forward == time backward input == time backward weights. In practice, this is not likely true for real models so alternatively a greedy scheduler could be implemented for unequal/unbalanced time.

The DualPipeV schedule. A more efficient schedule variant based on the DualPipe schedule introduced by DeepSeek in https://arxiv.org/pdf/2412.19437

Based on the open sourced code from deepseek-ai/DualPipe

Base class for single-stage schedules. Implements the step method. Derived classes should implement _step_microbatches.

Gradients are scaled by num_microbatches depending on the scale_grads argument, defaulting to True. This setting should match the configuration of your loss_fn, which may either average losses (scale_grads=True) or sum losses (scale_grads=False).

Run one iteration of the pipeline schedule with whole-batch input. Will chunk the input into microbatches automatically, and go through the microbatches according to the schedule implementation.

args: positional arguments to the model (as in non-pipeline case). kwargs: keyword arguments to the model (as in non-pipeline case). target: target for the loss function. losses: a list to store the losses for each microbatch.

Base class for multi-stage schedules. Implements the step method.

Gradients are scaled by num_microbatches depending on the scale_grads argument, defaulting to True. This setting should match the configuration of your loss_fn, which may either average losses (scale_grads=True) or sum losses (scale_grads=False).

Run one iteration of the pipeline schedule with whole-batch input. Will chunk the input into microbatches automatically, and go through the microbatches according to the schedule implementation.

args: positional arguments to the model (as in non-pipeline case). kwargs: keyword arguments to the model (as in non-pipeline case). target: target for the loss function. losses: a list to store the losses for each microbatch.

---

## Tensor Parallelism - torch.distributed.tensor.parallel#

**URL:** https://pytorch.org/docs/stable/distributed.tensor.parallel.html

**Contents:**
- Tensor Parallelism - torch.distributed.tensor.parallel#

Created On: Jun 13, 2025 | Last Updated On: Jun 13, 2025

Tensor Parallelism(TP) is built on top of the PyTorch DistributedTensor (DTensor)[https://github.com/pytorch/pytorch/blob/main/torch/distributed/tensor/README.md] and provides different parallelism styles: Colwise, Rowwise, and Sequence Parallelism.

Tensor Parallelism APIs are experimental and subject to change.

The entrypoint to parallelize your nn.Module using Tensor Parallelism is:

Apply Tensor Parallelism in PyTorch by parallelizing modules or sub-modules based on a user-specified plan.

We parallelize module or sub_modules based on a parallelize_plan. The parallelize_plan contains ParallelStyle, which indicates how user wants the module or sub_module to be parallelized.

User can also specify different parallel style per module fully qualified name (FQN).

Note that parallelize_module only accepts a 1-D DeviceMesh, if you have a 2-D or N-D DeviceMesh, slice the DeviceMesh to a 1-D sub DeviceMesh first then pass to this API(i.e. device_mesh["tp"])

module (nn.Module) – Module to be parallelized.

device_mesh (DeviceMesh, optional) – Object which describes the mesh topology of devices for the DTensor. If not specified, the call must be under a DeviceMesh context.

parallelize_plan (Union[ParallelStyle, Dict[str, ParallelStyle]], optional) – The plan used to parallelize the module. It can be either a ParallelStyle object which contains how we prepare input/output for Tensor Parallelism or it can be a dict of module FQN and its corresponding ParallelStyle object. If not specified, the call will do nothing at the moment.

src_data_rank (int, optional) – the rank of the source data for the logical/global tensor, it is used by distribute_tensor() to scatter/broadcast the shards/replicas to other ranks. By default, we use group_rank=0 on each DeviceMesh dimension as the source data to preserve the single-device semantic. If passing None explicitly, parallelize_module() simply uses its local data instead of trying to preserve the single-device semantic via scatter/broadcast. Default: 0

A nn.Module object parallelized.

For complex module architecture like Attention, MLP layers, we recommend composing different ParallelStyles together (i.e. ColwiseParallel and RowwiseParallel) and pass as a parallelize_plan, to achieves the desired sharding computation.

Tensor Parallelism supports the following parallel styles:

Partition a compatible nn.Module in a column-wise fashion. Currently supports nn.Linear and nn.Embedding. Users can compose it together with RowwiseParallel to achieve the sharding of more complicated modules. (i.e. MLP, Attention)

input_layouts (Placement, optional) – The DTensor layout of input tensor for the nn.Module, this is used to annotate the input tensor to become a DTensor. If not specified, we assume the input tensor to be replicated.

output_layouts (Placement, optional) – The DTensor layout of the output for the nn.Module, this is used to ensure the output of the nn.Module with the user desired layout. If not specified, the output tensor is sharded on the last dimension.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module output, default: True.

A ParallelStyle object that represents Colwise sharding of the nn.Module.

By default ColwiseParallel output is sharded on the last dimension if the output_layouts not specified, if there’re operators that require specific tensor shape (i.e. before the paired RowwiseParallel), keep in mind that if the output is sharded the operator might need to be adjusted to the sharded size.

Partition a compatible nn.Module in a row-wise fashion. Currently supports nn.Linear and nn.Embedding. Users can compose it with ColwiseParallel to achieve the sharding of more complicated modules. (i.e. MLP, Attention)

input_layouts (Placement, optional) – The DTensor layout of input tensor for the nn.Module, this is used to annotate the input tensor to become a DTensor. If not specified, we assume the input tensor to be sharded on the last dimension.

output_layouts (Placement, optional) – The DTensor layout of the output for the nn.Module, this is used to ensure the output of the nn.Module with the user desired layout. If not specified, the output tensor is replicated.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module output, default: True.

A ParallelStyle object that represents Rowwise sharding of the nn.Module.

SequenceParallel replicates a compatible nn.Module parameters and runs the sharded computation with input sharded on the sequence dimension. This currently supports nn.LayerNorm, nn.Dropout, and the RMSNorm python implementation

This style implements the operation that is described in the paper Reducing Activation Recomputation in Large Transformer Models

If the input passed in to this nn.Module is a torch.Tensor, it assumes that the input is already sharded on the sequence dimension and converts the input to a DTensor sharded on the sequence dimension. If the input passed in to this nn.Module is already a DTensor but is not sharded on the sequence dimension, it would redistribute the input to be sharded on the sequence dimension.

The output of the nn.Module will be sharded on the sequence dimension.

sequence_dim (int, optional) – The sequence dimension of the input tensor for the nn.Module, this is used to annotate the input tensor to become a DTensor that is sharded on the sequence dimension, default: 1.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module output, default: False.

A ParallelStyle object that represents Sequence Parallel of the nn.Module.

SequenceParallel style assumes ones initialization if there are weights in the nn.Module (i.e. nn.LayerNorm or RMSNorm, and they by default have ones initialization). If you have custom inits for the weights on those modules, you need to broadcast the weights before/after parallelizing to ensure that they are replicated.

To simply configure the nn.Module’s inputs and outputs with DTensor layouts and perform necessary layout redistributions, without distribute the module parameters to DTensors, the following ParallelStyle s can be used in the parallelize_plan when calling parallelize_module:

Configure the nn.Module’s inputs to convert the input tensors of the nn.Module to DTensors at runtime according to input_layouts, and perform layout redistribution according to the desired_input_layouts.

input_layouts (Union[Placement, Tuple[Optional[Placement]]]) – The DTensor layouts of input tensors for the nn.Module, this is used to convert the input tensors to DTensors. If some inputs are not torch.Tensor or no need to convert to DTensors, None need to be specified as a placeholder. default: None.

desired_input_layouts (Union[Placement, Tuple[Optional[Placement]]]) – The desired DTensor layout of input tensors for the nn.Module, this is used to ensure the inputs of the nn.Module have the desired DTensor layouts. This argument needs to have the same length with input_layouts. default: None.

input_kwarg_layouts (Dict[str, Placement]) – The DTensor layouts of input kwargs for the nn.Module, this is used to convert the input kwarg tensors to DTensors. default: None

desired_input_kwarg_layouts – (Dict[str, Placement]): The desired DTensor layout of input kwargs for the nn.Module, this is used to ensure the inputs of the nn.Module have the desired DTensor layouts. default: None.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module inputs, default: False.

A ParallelStyle object that prepares the sharding layouts of the nn.Module’s inputs.

Configure the nn.Module’s outputs to convert the output tensors of the nn.Module to DTensors at runtime according to output_layouts, and perform layout redistribution according to the desired_output_layouts.

output_layouts (Union[Placement, Tuple[Placement]]) – The DTensor layouts of output tensors for the nn.Module, this is used to convert the output tensors to DTensors if they are torch.Tensor. If some outputs are not torch.Tensor or no need to convert to DTensors, None need to be specified as a placeholder.

desired_output_layouts (Union[Placement, Tuple[Placement]]) – The desired DTensor layouts of output tensors for the nn.Module, this is used to ensure the outputs of the nn.Module have the desired DTensor layouts.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module outputs, default: True.

A ParallelStyle object that prepares the sharding layouts of the nn.Module’s outputs.

Configure the nn.Module’s inputs (and outputs) to convert the input tensors (and output tensors, respectively) of the nn.Module to DTensors at runtime according to input_layouts (and output_layouts, respectively), and perform layout redistribution according to the desired_input_layouts (and desired_output_layouts, respectively). This is a combination of PrepareModuleInput and PrepareModuleOutput.

input_layouts (Union[Placement, Tuple[Optional[Placement]]]) – The DTensor layouts of input tensors for the nn.Module, this is used to convert the input tensors to DTensors. If some inputs are not torch.Tensor or no need to convert to DTensors, None need to be specified as a placeholder. default: None.

desired_input_layouts (Union[Placement, Tuple[Optional[Placement]]]) – The desired DTensor layout of input tensors for the nn.Module, this is used to ensure the inputs of the nn.Module have the desired DTensor layouts. This argument needs to have the same length with input_layouts. default: None.

input_kwarg_layouts (Dict[str, Placement]) – The DTensor layouts of input kwargs for the nn.Module, this is used to convert the input kwarg tensors to DTensors. default: None

desired_input_kwarg_layouts – (Dict[str, Placement]): The desired DTensor layout of input kwargs for the nn.Module, this is used to ensure the inputs of the nn.Module have the desired DTensor layouts. default: None.

use_local_input (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module inputs, default: False.

output_layouts (Union[Placement, Tuple[Placement]]) – The DTensor layouts of output tensors for the nn.Module, this is used to convert the output tensors to DTensors if they are torch.Tensor. If some outputs are not torch.Tensor or no need to convert to DTensors, None need to be specified as a placeholder.

desired_output_layouts (Union[Placement, Tuple[Placement]]) – The desired DTensor layouts of output tensors for the nn.Module, this is used to ensure the outputs of the nn.Module have the desired DTensor layouts.

use_local_output (bool, optional) – Whether to use local torch.Tensor instead of DTensor for the module outputs, default: True.

A ParallelStyle object that prepares the sharding layouts of the nn.Module’s inputs and outputs.

when using the Shard(dim) as the input/output layouts for the above ParallelStyle s, we assume the input/output activation tensors are evenly sharded on the tensor dimension dim on the DeviceMesh that TP operates on. For instance, since RowwiseParallel accepts input that is sharded on the last dimension, it assumes the input tensor has already been evenly sharded on the last dimension. For the case of uneven sharded activation tensors, one could pass in DTensor directly to the partitioned modules, and use use_local_output=False to return DTensor after each ParallelStyle, where DTensor could track the uneven sharding information.

For models like Transformer, we recommend users to use ColwiseParallel and RowwiseParallel together in the parallelize_plan for achieve the desired sharding for the entire model (i.e. Attention and MLP).

Parallelized cross-entropy loss computation (loss parallelism), is supported via the following context manager:

A context manager that enables loss parallelism, where efficient parallelized loss computation can be performed when the input is sharded on the class dimension. Currently only the cross-entropy loss is supported.

Within this context manager, one can use cross_entropy() or CrossEntropyLoss as usual, with the following assumptions on the input parameters. The corresponding backward() call, if any, also needs to happen under this context manager.

input (DTensor) – Input logits. Assumed to be sharded on the class dimension.

target (Union[torch.Tensor, DTensor]) – Must be ground truth class indices (class probabilities currently not supported). Assumed to be replicated across the DeviceMesh.

weight (Union[torch.Tensor, DTensor], optional) – If given, assumed to be replicated across the DeviceMesh.

label_smoothing – Currently not supported.

A replicated DTensor.

A sharded DTensor is manually created here to showcase the usage. In practice, it is usually the output of a TP module.

---
