pub mod constants;
pub mod errors;
pub mod state;
pub mod ix_create_collection;
pub mod ix_delegate_nft;
pub mod ix_mint_nft;
pub mod ix_transfer_collection;
pub mod ix_transfer_nft;
pub mod ix_update_collection;


use anchor_lang::prelude::*;

use crate::constants::*;
use crate::errors::*;
use crate::ix_create_collection::*;
use crate::ix_delegate_nft::*;
use crate::ix_mint_nft::*;
use crate::ix_transfer_collection::*;
use crate::ix_transfer_nft::*;
use crate::ix_update_collection::*;
use crate::state::*;

declare_id!("Edc4wW4o8wyxm8NVGcizYX731ioTGxvvHPxnByXmR7iQ");

#[program]
pub mod nftoken {
    use crate::ix_transfer_collection::transfer_collection_inner;
    use super::*;

    pub fn mint_nft(ctx: Context<MintNft>, name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128], collection_included: bool) -> Result<()> {
        return mint_nft_inner(ctx, name, image_url, metadata_url, collection_included);
    }

    pub fn transfer_nft(ctx: Context<TransferNft>) -> Result<()> {
        return transfer_nft_inner(ctx);
    }

    pub fn delegate_nft(ctx: Context<DelegateNft>, set_delegate: bool) -> Result<()> {
        return delegate_nft_inner(ctx, set_delegate)
    }

    pub fn create_collection(ctx: Context<CreateCollection>, name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128]) -> Result<()> {
        return create_collection_inner(ctx, name, image_url, metadata_url)
    }

    pub fn update_collection(ctx: Context<UpdateCollection>, name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128], creator_can_update: bool) -> Result<()> {
        return update_collection_inner(ctx, name, image_url, metadata_url, creator_can_update);
    }

    pub fn transfer_collection(ctx: Context<TransferCollection>) -> Result<()> {
        return transfer_collection_inner(ctx);
    }
}
