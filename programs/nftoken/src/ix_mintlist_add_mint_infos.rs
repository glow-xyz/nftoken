use crate::account_types::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use std::convert::TryInto;

/// Adds multiple `MintInfo`'s to the `mintlist`.
pub fn mintlist_add_mint_infos_inner(
    ctx: Context<MintlistAddMintInfos>,
    mint_infos: Vec<MintInfoArg>,
) -> Result<()> {
    let mintlist_account = &mut ctx.accounts.mintlist.load_mut()?;

    let len_to_add: u16 = mint_infos
        .len()
        .try_into()
        .map_err(|_err| error!(NftokenError::TooManyMintInfos))?;

    let mint_infos_added = mintlist_account.mint_infos_added;
    let available_mint_info_slots = mintlist_account.num_mints - mint_infos_added;

    require!(
        len_to_add as u16 <= available_mint_info_slots,
        NftokenError::TooManyMintInfos
    );

    for (i, mint_info) in mint_infos.iter().enumerate() {
        mintlist_account.mint_infos[usize::from(mint_infos_added) + i] = mint_info.into()
    }

    mintlist_account.mint_infos_added += len_to_add;

    Ok(())
}

#[derive(Accounts)]
pub struct MintlistAddMintInfos<'info> {
    #[account(mut, has_one = creator)]
    pub mintlist: AccountLoader<'info, MintlistAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}
