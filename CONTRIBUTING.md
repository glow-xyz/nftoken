# Contributing

Contributions to this repo are welcome!

## Dev Environment

You'll need to install a few things to get this running. This guide will assume you are using a Mac, but it probably applies to Linux. 

We use [Anchor](https://github.com/project-serum/anchor) to write this program. Anchor gives us a framework that makes it easier to write Solana programs. You can think of Anchor like the React of Solana Dev. Without Anchor, we have to write lower level code which is harder (like Vanilla JS in the React metaphor).

### Install Rust

Solana and Anchor are written in and built with Rust. So we'll need to install Rust and Cargo which is the package manager for Rust. 

[Install Rust](https://www.rust-lang.org/tools/install)

**Learning Rust**

You actually don't need to know that much Rust in order to code Solana. But if you want to play around with it, [the Rust Book](https://doc.rust-lang.org/book/) and the [Rustlings](https://github.com/rust-lang/rustlings) projects are good resources.

### Install Solana

You'll need to have Solana + Rust installed in order to run this locally.

[Solana Docs](https://docs.solana.com/cli/install-solana-cli-tools)

### Install Anchor 

Anchor makes an `avm` CLI tool which makes it easy to upgrade Anchor versions on your machine. 

You can follow the [Anchor book instructions](https://book.anchor-lang.com/getting_started/installation.html) to install Anchor.

### Running a Local Solana Validator

Once you have Solana installed, you can run a local validator on your machine. The local validator will have its own account state and you will deploy / test programs against this validator.

I run my validator with this command:

```shell
solana-test-validator -r
```

The `-r` flag will delete all of the previous state so you are starting fresh. 

Once you are running your local validator, you can see if your `solana` CLI tool is pointed at it by doing:

```shell
solana config get
```

And if you want to see your current address or balance you can run:

```shell
solana address
solana balance
```

### Running Tests

When I am running the tests, I usually have a local validator running so that the test running doesn't need to start a validator.

```shell
anchor test --provider.cluster localnet --skip-local-validator
```
