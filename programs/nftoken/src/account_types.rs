use crate::errors::NftokenError;
use anchor_lang::prelude::*;
use std::convert::TryFrom;

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

    pub creator: Pubkey,          // 32
    pub creator_can_update: bool, // 1

    pub name: [u8; 32],         // 32
    pub image_url: [u8; 64],    // 64
    pub metadata_url: [u8; 64], // 64

    pub collection: Pubkey, // 32
    pub delegate: Pubkey,   // 32

    pub created_at: i64, // 8
}

#[account(zero_copy)]
pub struct MintlistAccount {
    pub version: u8, // 1

    /// Order of going through the list of `MintInfo`'s during the minting process.
    pub minting_order: MintingOrder, // 1

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_mints: u16, // 2

    /// Number of NFTs already minted from the mintlist.
    pub mints_redeemed: u16, // 2

    pub mint_infos_added: u16, // 2

    /// The pubkey that will be set as the creator of the NTFs minted from the mintlist.
    pub creator: Pubkey, // 32

    /// SOL wallet to receive proceedings from SOL payments.
    pub treasury_sol: Pubkey, // 32

    /// Timestamp when minting is allowed.
    pub go_live_date: i64, // 8

    /// Price to pay for minting an NFT from the mintlist.
    pub price: u64, // 8

    /// Optional pubkey of the collection the NFTs minted from the mintlist will belong to.
    pub collection: Pubkey, // 32

    pub created_at: i64, // 8

    pub mint_infos: [MintInfo; 10000],
}

impl MintlistAccount {
    pub fn size(num_mints: u16) -> usize {
        // Account discriminator
        8
        // version
        + 1
        // minting_order
        + 1
        // num_mints
        + 2
        // mints_redeemed
        + 2
        // mint_infos_added
        + 2
        // creator
        + 32
        // treasury_sol
        + 32
        // go_live_date
        + 8
        // price
        + 8
        // collection
        + 32
        // created_at
        + 8
        // mint_infos
        // FIXME: When we figure out how to store the list of `MintInfo`'s, we might need to add the size of the container.
        + (num_mints as usize) * MintInfo::size()
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Copy)]
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

#[zero_copy]
pub struct MintInfo {
    pub name: [u8; 32],         // 32
    pub image_url: [u8; 64],    // 64
    pub metadata_url: [u8; 64], // 64
    pub minted: bool,           // 1
    _alignment: [u8; 7],        // 7
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
        // _alignment
        + 7
    }
}

impl From<&MintInfoArg> for MintInfo {
    fn from(mint_info: &MintInfoArg) -> Self {
        Self {
            name: mint_info.name,
            image_url: mint_info.image_url,
            metadata_url: mint_info.metadata_url,
            minted: false,
            _alignment: Default::default(),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintInfoArg {
    pub name: [u8; 32],         // 32
    pub image_url: [u8; 64],    // 64
    pub metadata_url: [u8; 64], // 64
}
