use anchor_lang::prelude::*;

#[account]
pub struct CollectionAccount {
    pub version: u8,

    pub creator: Pubkey,
    pub creator_can_update: bool,

    pub name: [u8; 32],
    pub image_url: [u8; 64],
    pub metadata_url: [u8; 64],

    pub created_at: i64,
}

#[account]
pub struct NftAccount {
    pub version: u8, // 1

    pub holder: Pubkey, // 32

    pub creator: Pubkey, // 32
    pub creator_can_update: bool, // 1

    pub name: [u8; 32], // 32
    pub image_url: [u8; 64], // 64
    pub metadata_url: [u8; 64], // 64

    pub collection: Pubkey, // 32
    pub delegate: Pubkey, // 32

    pub created_at: i64, // 8
}

