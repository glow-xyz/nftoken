use anchor_lang::prelude::*;
use crate::account_types::*;
use crate::errors::*;


/// Adds multiple `MintInfo`'s to the `mintlist`.
pub fn mintlist_add_mint_infos_inner(ctx: Context<MintlistAddMintInfos>, args: MintlistAddMintInfosArgs) -> Result<()> {
    let mintlist_account = &mut ctx.accounts.mintlist;
    todo!()
    // Ok(())
}

#[derive(Accounts)]
pub struct MintlistAddMintInfos<'info> {
    #[account(mut, has_one = creator)]
    mintlist: Account<'info, MintlistAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintlistAddMintInfosArgs {

}
