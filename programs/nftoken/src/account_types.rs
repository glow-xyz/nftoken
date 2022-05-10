use crate::errors::NftokenError;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::clock::UnixTimestamp;
use std::convert::TryFrom;

#[account]
pub struct CollectionAccount {
    pub version: u8,              // 1
    pub creator: Pubkey,          // 32
    pub creator_can_update: bool, // 1
    pub metadata_url: [u8; 64],   // 1
}

#[account]
pub struct NftAccount {
    pub version: u8,              // 1
    pub holder: Pubkey,           // 32
    pub creator: Pubkey,          // 32
    pub creator_can_update: bool, // 1
    pub collection: Pubkey,       // 32
    pub delegate: Pubkey,         // 32
    pub metadata_url: [u8; 64],   // 64
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
    pub price_lamports: u64,

    /// Order of going through the list of `MintInfo`'s during the minting process.
    pub minting_order: MintingOrder,

    /// Pubkey of the collection the NFTs minted from the mintlist will belong to.
    pub collection: Pubkey,

    /// Metadata that stores name, avatar, etc of the mintlist
    pub metadata_url: [u8; 64],

    /// Timestamp when the mintlist was created.
    pub created_at: i64,

    /// Maximum number of NFTs that can be minted from the mintlist.
    pub num_nfts_total: u32,

    /// Number of NFTs already minted from the mintlist.
    pub num_nfts_redeemed: u32,

    /// Number of already uploaded mint_infos.
    /// Note: we store this and the `mint_infos` next to each other so that we can treat the two
    /// combined as `Vec<MintInfo>`. Borsh serialized a `Vec` as:
    ///
    /// ```
    /// repr(len() as u32);
    /// for el in x {
    ///   repr(el as ident);
    /// }
    /// ```
    ///
    /// But we can't store a `Vec<MintInfo>` here since we want to avoid Rust attempting to
    /// deserialize the `mint_info` list which would cause Solana to go over the stack / frame
    /// limits.
    pub num_nfts_configured: u32,
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
        if self.num_nfts_configured != self.num_nfts_total {
            return false;
        }

        // Check if the mintlist has available nfts
        if self.num_nfts_redeemed >= self.num_nfts_total {
            return false;
        }

        // Check if the mintlist is ready for minting
        if self.go_live_date > now {
            return false;
        }

        return true;
    }

    // TODO: can we get this from the MintlistAccount itself?
    pub fn size(num_nfts: u32) -> usize {
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
        // collection
        + 32
        // metadata_url
        + 64
        // created_at
        + 8
        // num_mints
        + 4
        // mints_redeemed
        + 4
        // num_nfts_configured
        + 4
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
    pub minted: bool,           // 1
    pub metadata_url: [u8; 64], // 64
}

impl MintInfo {
    pub fn size() -> usize {
        // minted
        1
        // metadata_url
        + 64
    }
}

impl From<&MintInfoArg> for MintInfo {
    fn from(mint_info: &MintInfoArg) -> Self {
        Self {
            minted: false,
            metadata_url: mint_info.metadata_url,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintInfoArg {
    pub metadata_url: [u8; 64],
}
