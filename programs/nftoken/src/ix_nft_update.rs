use crate::account_types::NftAccount;
use crate::errors::NftokenError;
use anchor_lang::prelude::*;

///  # Update NFT
///
/// Update the nft information on chain.
pub fn nft_update_inner(ctx: Context<NftUpdate>, args: NftUpdateArgs) -> Result<()> {
    let nft = &mut ctx.accounts.nft;

    let action_allowed = nft.creator.key() == ctx.accounts.creator.key();
    require!(action_allowed, NftokenError::Unauthorized);
    require!(nft.creator_can_update, NftokenError::Unauthorized);

    nft.metadata_url = args.metadata_url;
    nft.creator_can_update = args.creator_can_update;

    Ok(())
}

#[derive(Accounts)]
#[instruction(args: NftUpdateArgs)]
pub struct NftUpdate<'info> {
    #[account(mut, has_one = creator)]
    pub nft: Account<'info, NftAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct NftUpdateArgs {
    pub metadata_url: [u8; 64],
    pub creator_can_update: bool,
}
