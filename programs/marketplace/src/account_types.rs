use anchor_lang::prelude::*;

#[account]
pub struct NftListingAccount {
    // discriminator = 8
    pub version: u8,    // 1 = 9
    pub seller: Pubkey, // 32 = 41
    pub nft: Pubkey,    // 32 = 73
    pub price_sol: u64, // 8  = 81
    pub bump: u8,       // 1  = 82
}

pub const NFT_LISTING_ACCOUNT_SIZE: usize = 90;
