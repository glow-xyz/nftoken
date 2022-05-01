use anchor_lang::prelude::*;

declare_id!("Edc4wW4o8wyxm8NVGcizYX731ioTGxvvHPxnByXmR7iQ");

#[program]
pub mod nftoken {
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: [u8; 32],
        image_url: [u8; 128],
        metadata_url: [u8; 128],
        collection_included: bool,
    ) -> anchor_lang::Result<()> {
        let nft_account = &mut ctx.accounts.nft_account;

        if collection_included {
            msg!("HIIIIIIIIIIIIIIIIIIIII COLLECTION");

            let collection_info: &AccountInfo = &ctx.remaining_accounts[0];
            require!(collection_info.owner == ctx.program_id, NftokenError::Unauthorized);

            let mut collection_data: &[u8] = &collection_info.try_borrow_data()?;
            let collection_account = CollectionAccount::try_deserialize(&mut collection_data)?;

            let collection_authority_info = &ctx.remaining_accounts[1];

            require!( collection_authority_info.is_signer, NftokenError::Unauthorized);
            require!(
                &collection_account.update_authority.unwrap() == collection_authority_info.key,
                NftokenError::Unauthorized
            );

            nft_account.collection = Some(*collection_info.key);
        } else {
            nft_account.collection = None;
        }

        nft_account.holder = ctx.accounts.holder.key();
        nft_account.update_authority = Some(ctx.accounts.holder.key());
        nft_account.delegate = None;
        nft_account.name = name;
        nft_account.image_url = image_url;
        nft_account.metadata_url = metadata_url;

        Ok(())
    }

    // You can transfer the NFT if you are the holder OR the delegate
    // in either case, after you transfer the NFT it is set to null.
    pub fn transfer_nft(
        ctx: Context<TransferNft>
    ) -> anchor_lang::Result<()> {
        // TODO check that you are either the delegate or the owner
        let signer = &ctx.accounts.signer;
        let nft_account = &mut ctx.accounts.nft_account;

        let delegate = nft_account.delegate;

        let transfer_allowed =
            // The NFT holder can make a transfer
            nft_account.holder.key() == signer.key()
                // So can the delegate, if the delegate is set.
                || (delegate.is_some() && delegate.unwrap().key() == signer.key());

        require!(transfer_allowed, NftokenError::TransferUnauthorized);

        nft_account.holder = ctx.accounts.recipient.key();
        nft_account.delegate = None;

        Ok(())
    }

    pub fn delegate_nft(
        ctx: Context<DelegateNft>,
        set_delegate: bool,
    ) -> Result<()> {
        let signer = &ctx.accounts.signer;
        let nft_account = &mut ctx.accounts.nft_account;

        if set_delegate {
            let action_allowed = nft_account.holder.key() == signer.key();
            require!(action_allowed, NftokenError::Unauthorized);

            nft_account.delegate = Some(ctx.remaining_accounts[0].key());
        } else {
            let current_delegate = &nft_account.delegate;
            let action_allowed =
                // The NFT holder can remove the delegate
                nft_account.holder.key() == signer.key()
                    // So can the delegate, if the delegate is set.
                    || (current_delegate.is_some() && current_delegate.unwrap().key() == signer.key());

            require!(action_allowed, NftokenError::DelegateUnauthorized);
            nft_account.delegate = None;
        }

        Ok(())
    }

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: [u8; 32],
        image_url: [u8; 128],
        metadata_url: [u8; 128],
    ) -> Result<()> {
        let collection_account = &mut ctx.accounts.collection_account;

        collection_account.update_authority = Some(ctx.accounts.creator.key());
        collection_account.name = name;
        collection_account.image_url = image_url;
        collection_account.metadata_url = metadata_url;

        Ok(())
    }
}

// TODO: is this on a PDA or what is the account?
//       should it be a PDA with seeds or an account owned by the program?
#[account]
pub struct NftAccount {
    pub holder: Pubkey,
    pub name: [u8; 32],
    // Metaplex uses `String`, but this is bad
    pub image_url: [u8; 128],
    pub metadata_url: [u8; 128],
    pub update_authority: Option<Pubkey>,
    pub collection: Option<Pubkey>,
    pub delegate: Option<Pubkey>,
}

/// TODO: do we want to use fixed size optionals for pubkeys? if we don't do
///       fixed size then we are going to break `getProgramAccounts`
#[account]
pub struct CollectionAccount {
    pub name: [u8; 32],
    // Metaplex uses `String`, but this is bad
    pub image_url: [u8; 128],
    pub metadata_url: [u8; 128],
    pub update_authority: Option<Pubkey>,
}

#[derive(Accounts)]
#[instruction(
name: [u8; 32],
image_url: [u8; 128],
metadata_url: [u8; 128],
collection_included: bool
)]
pub struct MintNft<'info> {
    #[account(init, payer = holder, space = 500)]
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub holder: Signer<'info>,

    pub system_program: Program<'info, System>,

    // Remaining accounts
    //
    // If we want to include a collection, we specify:
    // * `collection` - this is the address of the collection
    // * `collection_authority` - this should be the update authority on the collection
    //                            in the future this could be the `mint_authority`
}

#[derive(Accounts)]
#[instruction()]
pub struct TransferNft<'info> {
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: this can be any type
    pub recipient: AccountInfo<'info>,
}

#[derive(Accounts)]
#[instruction(set_delegate: bool)]
pub struct DelegateNft<'info> {
    #[account(mut)]
    pub nft_account: Account<'info, NftAccount>,

    #[account(mut)]
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(name: [u8; 32], image_url: [u8; 128], metadata_url: [u8; 128])]
pub struct CreateCollection<'info> {
    #[account(init, payer = creator, space = 500)]
    pub collection_account: Account<'info, CollectionAccount>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[error_code]
pub enum NftokenError {
    #[msg("You don't have permission to transfer this NFT.")]
    TransferUnauthorized,
    #[msg("You don't have permission to delegate this NFT.")]
    DelegateUnauthorized,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
}
