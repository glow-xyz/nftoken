use crate::account_types::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use std::convert::TryInto;

/// # Mintlist - Add Mint Infos
///
/// Adds multiple `MintInfo`'s to the `mintlist`.
pub fn mintlist_add_mint_infos_inner(
    ctx: Context<MintlistAddMintInfos>,
    args: MintlistAddMintInfosArgs,
) -> Result<()> {
    let mintlist = &mut ctx.accounts.mintlist;

    // We make this check to help ensure that someone doesn't create duplicate NFTs. Without this
    // check if you retry a transaction to add 3 Mint Infos, you could add those Mint Infos more
    // than once.
    require!(
        mintlist.num_nfts_configured == args.current_nft_count,
        NftokenError::Unauthorized
    );

    let len_to_add: u32 = args
        .mint_infos
        .len()
        .try_into()
        .map_err(|_err| error!(NftokenError::TooManyMintInfos))?;

    let num_nfts_configured = mintlist.num_nfts_configured;
    let available_mint_info_slots = mintlist.num_nfts_total - num_nfts_configured;

    require!(
        len_to_add <= available_mint_info_slots,
        NftokenError::TooManyMintInfos
    );

    mintlist.num_nfts_configured += len_to_add;

    let mintlist_account_info = mintlist.to_account_info();
    let mut mintlist_data = mintlist_account_info.data.borrow_mut();

    let mint_info_size = MintInfo::size();
    let insertion_byte_pos = MintlistAccount::size(num_nfts_configured);
    for (i, mint_info_arg) in args.mint_infos.iter().enumerate() {
        let mint_info = MintInfo::from(mint_info_arg);
        mint_info.serialize(&mut &mut mintlist_data[insertion_byte_pos + i * mint_info_size..])?
    }

    Ok(())
}

#[derive(Accounts)]
pub struct MintlistAddMintInfos<'info> {
    #[account(mut, has_one = creator)]
    pub mintlist: Account<'info, MintlistAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct MintlistAddMintInfosArgs {
    pub current_nft_count: u32,
    pub mint_infos: Vec<MintInfoArg>,
}
