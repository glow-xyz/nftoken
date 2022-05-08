pub mod account_types;
pub mod constants;
pub mod errors;
pub mod ix_collection_create;
pub mod ix_collection_transfer;
pub mod ix_collection_update;
pub mod ix_mintlist_add_mint_infos;
pub mod ix_mintlist_create;
pub mod ix_mintlist_mint_nft;
pub mod ix_nft_create;
pub mod ix_nft_set_collection;
pub mod ix_nft_set_delegate;
pub mod ix_nft_transfer;
pub mod ix_nft_unset_collection;
pub mod ix_nft_unset_delegate;
pub mod ix_nft_update;

use anchor_lang::prelude::*;

use crate::ix_collection_create::*;
use crate::ix_collection_transfer::*;
use crate::ix_collection_update::*;
use crate::ix_mintlist_add_mint_infos::*;
use crate::ix_mintlist_create::*;
use crate::ix_mintlist_mint_nft::*;
use crate::ix_nft_create::*;
use crate::ix_nft_set_collection::*;
use crate::ix_nft_set_delegate::*;
use crate::ix_nft_transfer::*;
use crate::ix_nft_unset_collection::*;
use crate::ix_nft_unset_delegate::*;
use crate::ix_nft_update::*;

use crate::account_types::*;

declare_id!("nf2DH8Wq3uZdYEkqFqQ2LQ8rVJx6Lffw6jPa2JWBgXH");

#[program]
pub mod nftoken {
    use super::*;

    /// NFT Instructions
    pub fn nft_create(ctx: Context<NftCreate>, args: NftCreateArgs) -> Result<()> {
        return nft_create_inner(ctx, args);
    }

    pub fn nft_update(
        ctx: Context<NftUpdate>,
        name: [u8; 32],
        image_url: [u8; 64],
        metadata_url: [u8; 64],
        creator_can_update: bool,
    ) -> Result<()> {
        return nft_update_inner(ctx, name, image_url, metadata_url, creator_can_update);
    }

    pub fn nft_transfer(ctx: Context<TransferNft>) -> Result<()> {
        return transfer_nft_inner(ctx);
    }

    pub fn nft_set_delegate(ctx: Context<NftSetDelegate>) -> Result<()> {
        return nft_set_delegate_inner(ctx);
    }

    pub fn nft_unset_delegate(ctx: Context<NftUnsetDelegate>) -> Result<()> {
        return nft_unset_delegate_inner(ctx);
    }

    pub fn nft_set_collection(ctx: Context<NftSetCollection>) -> Result<()> {
        return nft_set_collection_inner(ctx);
    }

    pub fn nft_unset_collection(ctx: Context<NftUnsetCollection>) -> Result<()> {
        return nft_unset_collection_inner(ctx);
    }

    /// Collection Instructions
    pub fn collection_create(
        ctx: Context<CollectionCreate>,
        name: [u8; 32],
        image_url: [u8; 64],
        metadata_url: [u8; 64],
    ) -> Result<()> {
        return collection_create_inner(ctx, name, image_url, metadata_url);
    }

    pub fn collection_update(
        ctx: Context<CollectionUpdate>,
        name: [u8; 32],
        image_url: [u8; 64],
        metadata_url: [u8; 64],
        creator_can_update: bool,
    ) -> Result<()> {
        return collection_update_inner(ctx, name, image_url, metadata_url, creator_can_update);
    }

    pub fn transfer_collection(ctx: Context<CollectionTransferCreator>) -> Result<()> {
        return collection_transfer_creator_inner(ctx);
    }

    /// Mintlist instructions
    pub fn mintlist_create(ctx: Context<MintlistCreate>, args: MintlistCreateArgs) -> Result<()> {
        return mintlist_create_inner(ctx, args);
    }

    pub fn mintlist_add_mint_infos(
        ctx: Context<MintlistAddMintInfos>,
        mint_infos: Vec<MintInfoArg>,
    ) -> Result<()> {
        return mintlist_add_mint_infos_inner(ctx, mint_infos);
    }

    pub fn mintlist_mint_nft(ctx: Context<MintlistMintNft>) -> Result<()> {
        return mintlist_mint_nft_inner(ctx);
    }
}
