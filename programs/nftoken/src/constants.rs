use anchor_lang::prelude::*;

/// Note this is represented in base58 as `11111111111111111111111111111111` which is the same
/// as the system program.
pub const NULL_PUBKEY: Pubkey = Pubkey::new_from_array([0; 32]);

pub const NFT_ACCOUNT_SIZE: usize = 500;
