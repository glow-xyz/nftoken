use crate::errors::NftokenError;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::UnixTimestamp;
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

#[account]
pub struct MintlistAccount {
    pub version: u8,

    /// The pubkey that will be set as the creator of the NTFs minted from the mintlist.
    pub creator: Pubkey,

    /// SOL wallet to receive proceedings from SOL payments.
    pub treasury_sol: Pubkey,

    /// Timestamp when minting is allowed.
    pub go_live_date: i64,

    /// Price to pay for minting an NFT from the mintlist.
    pub price: u64,

    /// Order of going through the list of `MintInfo`'s during the minting process.
    pub minting_order: MintingOrder,

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_total_nfts: u16,

    /// Number of already uploaded mint_infos.
    pub num_nfts_configured: u16,

    /// Number of NFTs already minted from the mintlist.
    pub num_nfts_redeemed: u16,

    /// Optional pubkey of the collection the NFTs minted from the mintlist will belong to.
    pub collection: Pubkey,

    /// Timestamp when the mintlist was created.
    pub created_at: i64,
    // ---------------------------------------
    // Below we store `mint_infos`, we don't declare them on the type to avoid Anchor
    // deserialization. We cannot deserialize the mint infos since that will take us above the
    // stack and compute limits.
    //
    // `mint_infos`: MintInfo::size() x num_mints
}

impl MintlistAccount {
    pub fn is_mintable(&self, now: UnixTimestamp) -> bool {
        // Check if we have finished setting up the Mintlist
        if self.num_nfts_configured != self.num_total_nfts {
            return false;
        }

        // Check if the mintlist has available nfts
        if self.num_nfts_redeemed >= self.num_total_nfts {
            return false;
        }

        // Check if the mintlist is ready for minting
        if self.go_live_date > now {
            return false;
        }

        return true;
    }

    pub fn size(num_nfts: u16) -> usize {
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
        // minting_order
        + 1
        // num_mints
        + 2
        // mints_redeemed
        + 2
        // num_nfts_configured
        + 2
        // collection
        + 32
        // created_at
        + 8
        // mint_infos
        + num_nfts as usize * MintInfo::size()
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintInfo {
    pub name: [u8; 32],         // 32
    pub image_url: [u8; 64],    // 64
    pub metadata_url: [u8; 64], // 64
    pub minted: bool,           // 1
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

impl From<&MintInfoArg> for MintInfo {
    fn from(mint_info: &MintInfoArg) -> Self {
        Self {
            name: mint_info.name,
            image_url: mint_info.image_url,
            metadata_url: mint_info.metadata_url,
            minted: false,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintInfoArg {
    pub name: [u8; 32],
    pub image_url: [u8; 64],
    pub metadata_url: [u8; 64],
}
