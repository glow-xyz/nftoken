use std::convert::TryFrom;
use anchor_lang::prelude::*;
use crate::errors::NftokenError;

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

#[account]
pub struct MintlistAccount {
    pub version: u8, // 1

    /// The pubkey that will be set as the creator of the NTFs minted from the mintlist.
    pub creator: Pubkey, // 32

    /// SOL wallet to receive proceedings from SOL payments.
    pub treasury_sol: Pubkey, // 32

    /// Timestamp when minting is allowed.
    pub go_live_date: i64, // 8

    /// Price to pay for minting an NFT from the mintlist.
    pub price: u64, // 8

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_mints: u64, // 8

    /// Number of NFTs already minted from the mintlist.
    pub mints_redeemed: u64, // 8

    /// Order of going through the list of `MintInfo`'s during the minting process.
    pub minting_order: MintingOrder, // 1

    /// Optional pubkey of the collection the NFTs minted from the mintlist will belong to.
    pub collection: Pubkey, // 32

    pub created_at: i64, // 8

    // FIXME: Figure out how to store the list of MintInfo's without explicitly
    //        including it in the account type, to skip eager deserialization.
    //        Can we use `AccountLoader` or shall we copy whatever CandyMachine does?
}

impl MintlistAccount {
    pub fn size(num_mints: u64) -> usize {
        // Account discriminator
        8
        // version
        + 1
        // creator
        + 32
        // treasury_sol
        + 32
        // go_live_date
        + 8
        // price
        + 8
        // num_mints
        + 8
        // mints_redeemed
        + 8
        // minting_order
        + 1
        // collection
        + 32
        // created_at
        + 8
        // mint_infos
        // FIXME: When we figure out how to store the list of `MintInfo`'s, we might need to add the size of the container.
        + (num_mints as usize) * MintInfo::size()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
#[non_exhaustive]
pub enum MintingOrder {
    Sequential,
    Random,
}

impl TryFrom<String> for MintingOrder {
    type Error = NftokenError;
    fn try_from(s: String) -> std::result::Result<Self, Self::Error> {
        Ok(match s.as_ref() {
            "sequential" => Self::Sequential,
            "random" => Self::Random,
            _ => return Err(NftokenError::InvalidMintingOrder),
        })
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintInfo {
    pub name: [u8; 32], // 32
    pub image_url: [u8; 64], // 64
    pub metadata_url: [u8; 64], // 64
    pub minted: bool, // 1
}

impl MintInfo {
    pub fn size() -> usize {
        // name
        32
        // image_url
        + 64
        // metadata_url
        + 64
        // minted
        + 1
    }
}


