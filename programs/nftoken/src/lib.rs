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
use crate::ix_nft_setup_creators::*;
use crate::ix_nft_transfer::*;
use crate::ix_nft_unset_collection::*;
use crate::ix_nft_unset_delegate::*;
use crate::ix_nft_update::*;

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
pub mod ix_nft_setup_creators;
pub mod ix_nft_transfer;
pub mod ix_nft_unset_collection;
pub mod ix_nft_unset_delegate;
pub mod ix_nft_update;

declare_id!("nft54LYxr6noyvwaQKChAmRpnvn6yZGZkFDtajPz3u8");

#[program]
pub mod nftoken {
    use super::*;

    pub fn nft_create(ctx: Context<NftCreate>, args: NftCreateArgs) -> Result<()> {
        return nft_create_inner(ctx, args);
    }

    pub fn nft_update(ctx: Context<NftUpdate>, args: NftUpdateArgs) -> Result<()> {
        return nft_update_inner(ctx, args);
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

    pub fn nft_setup_creators(
        ctx: Context<NftSetupCreators>,
        args: NftSetupCreatorsArgs,
    ) -> Result<()> {
        return nft_setup_creators_inner(ctx, args);
    }

    pub fn collection_create(
        ctx: Context<CollectionCreate>,
        args: CollectionCreateArgs,
    ) -> Result<()> {
        return collection_create_inner(ctx, args);
    }

    pub fn collection_update(
        ctx: Context<CollectionUpdate>,
        args: CollectionUpdateArgs,
    ) -> Result<()> {
        return collection_update_inner(ctx, args);
    }

    pub fn transfer_collection(ctx: Context<CollectionTransferCreator>) -> Result<()> {
        return collection_transfer_creator_inner(ctx);
    }

    pub fn mintlist_create(ctx: Context<MintlistCreate>, args: MintlistCreateArgs) -> Result<()> {
        return mintlist_create_inner(ctx, args);
    }

    pub fn mintlist_add_mint_infos(
        ctx: Context<MintlistAddMintInfos>,
        args: MintlistAddMintInfosArgs,
    ) -> Result<()> {
        return mintlist_add_mint_infos_inner(ctx, args);
    }

    pub fn mintlist_mint_nft(ctx: Context<MintlistMintNft>) -> Result<()> {
        return mintlist_mint_nft_inner(ctx);
    }
}
