use crate::account_types::*;
use anchor_lang::prelude::*;

/// # Close Mintlist
///
/// Burning an Mintlist closes the account and returns the SOL to the authority.
pub fn mintlist_close_inner(_ctx: Context<MintlistClose>) -> Result<()> {
    Ok(())
}

#[derive(Accounts)]
#[instruction()]
pub struct MintlistClose<'info> {
    #[account(mut, has_one = authority, close = authority)]
    pub mintlist: Account<'info, MintlistAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
}
