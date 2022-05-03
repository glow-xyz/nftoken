use anchor_lang::prelude::*;

/// TODO: do we want to use fixed size optionals for pubkeys? if we don't do
///       fixed size then we are going to break `getProgramAccounts`
#[account]
pub struct CollectionAccount {
    // TODO: add version u8

    pub creator: Pubkey,
    pub creator_can_update: bool,

    pub name: [u8; 32],
    pub image_url: [u8; 128],
    pub metadata_url: [u8; 128],

    pub created_at: i64,
}

// TODO: is this on a PDA or what is the account?
//       should it be a PDA with seeds or an account owned by the program?
#[account]
pub struct NftAccount {
    // TODO: add version

    pub holder: Pubkey,

    pub creator: Pubkey,
    pub creator_can_update: bool,

    pub name: [u8; 32],
    pub image_url: [u8; 128],
    pub metadata_url: [u8; 128],

    pub collection: Pubkey,
    pub delegate: Pubkey,

    pub created_at: i64,
}

