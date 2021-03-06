use crate::account_types::*;
use crate::errors::*;
use anchor_lang::prelude::*;

/// # Setup NFT Creators
///
/// This lets you set up an account that stores information about the creators for an NFT.
///
/// This is useful for verifying creators and distributing royalties.
pub fn nft_setup_creators_inner(
    ctx: Context<NftSetupCreators>,
    args: NftSetupCreatorsArgs,
) -> Result<()> {
    let nft = &mut ctx.accounts.nft;
    require!(nft.authority_can_update, NftokenError::Unauthorized);

    // Ensure that the basis points are set up properly
    if args.royalty_basis_points != 0 {
        // Ensure that all of the basis points add up to 10_000 (100% * 100)
        let basis_points: Vec<u32> = args
            .creators
            .clone()
            .into_iter()
            .map(|creator| creator.basis_points as u32)
            .collect();
        let basis_points_sum: u32 = basis_points.iter().sum();
        require!(basis_points_sum == 10_000, NftokenError::Unauthorized);
    } else {
        // If royalty basis points = 0, then each creator should have 0 take
        for creator in args.creators.clone().into_iter() {
            require!(creator.basis_points == 0, NftokenError::Unauthorized);
        }
    }

    // Ensure that creator verification is correct
    for (idx, creator) in args.creators.clone().into_iter().enumerate() {
        let account: &AccountInfo = &ctx.remaining_accounts[idx];

        require!(account.key() == creator.address, NftokenError::Unauthorized);
        if creator.verified {
            require!(account.is_signer, NftokenError::Unauthorized);
        }
    }

    let nft_creators = &mut ctx.accounts.nft_creators;
    nft_creators.version = 1;
    nft_creators.royalty_basis_points = args.royalty_basis_points;
    nft_creators.nft = nft.key();
    nft_creators.creators = args.creators;

    nft.has_creators = true;

    Ok(())
}

/// # Remaining Accounts
///
/// If we want to add creators, we need to add them as remaining accounts
/// in both the account list and in the instructions.
///
/// We add them to both places so that:
///
/// 1. we can sign accounts that we expect to be verified
/// 2. this tx will show up in each creators transaction list
#[derive(Accounts)]
#[instruction(args: NftSetupCreatorsArgs)]
pub struct NftSetupCreators<'info> {
    /// This is the primary creator, the creator of the NFT.
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut, has_one = authority)]
    pub nft: Account<'info, NftAccount>,

    #[account(init, seeds = ["creators".as_bytes(), &nft.key().as_ref()], bump, payer = authority, space = NFT_CREATORS_ACCOUNT_SIZE)]
    pub nft_creators: Account<'info, NftCreatorsAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq)]
pub struct NftSetupCreatorsArgs {
    pub royalty_basis_points: u16,
    pub creators: Vec<NftSecondaryCreator>,
}
