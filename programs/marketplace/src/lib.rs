use anchor_lang::prelude::*;

use crate::ix_buy_nft::*;
use crate::ix_list_nft::*;

pub mod account_types;
pub mod errors;
pub mod ix_buy_nft;
pub mod ix_list_nft;

declare_id!("mkHj4viTkniLuS5gyC7fgHc5ia9ZVTGzHcTeLoJ4WfE");

#[program]
pub mod marketplace {
    use super::*;

    pub fn list_nft_v1(ctx: Context<ListNft>, args: ListNftArgs) -> Result<()> {
        return list_nft_inner(ctx, args);
    }

    pub fn buy_nft_v1(ctx: Context<BuyNft>, args: BuyNftArgs) -> Result<()> {
        return buy_nft_inner(ctx, args);
    }
}
