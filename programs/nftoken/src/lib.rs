pub mod constants;
pub mod errors;
pub mod state;
pub mod ix_update_collection;
pub mod ix_transfer_collection;
pub mod ix_mint_nft;


use anchor_lang::prelude::*;
use crate::ix_update_collection::*;
use crate::ix_mint_nft::*;
use crate::state::*;
use crate::errors::*;
use crate::constants::*;
use crate::ix_transfer_collection::*;

declare_id!("Edc4wW4o8wyxm8NVGcizYX731ioTGxvvHPxnByXmR7iQ");

#[program]
pub mod nftoken {
    use crate::ix_transfer_collection::transfer_collection_inner;
    use super::*;

    pub fn mint_nft(
        ctx: Context<MintNft>,
        name: [u8; 32],
        image_url: [u8; 128],
        metadata_url: [u8; 128],
        collection_included: bool,
    ) -> Result<()> {
        return mint_nft_inner(ctx, name, image_url, metadata_url, collection_included);
    }

    // You can transfer the NFT if you are the holder OR the delegate
    // in either case, after you transfer the NFT it is set to null.
    pub fn transfer_nft(
        ctx: Context<TransferNft>
    ) -> Result<()> {
        // TODO check that you are either the delegate or the owner
        let signer = &ctx.accounts.signer;
        let nft_account = &mut ctx.accounts.nft_account;

        let delegate = nft_account.delegate;

        let transfer_allowed =
            // The NFT holder can make a transfer
            nft_account.holder.key() == signer.key()
                // So can the delegate, if the delegate is set.
                || delegate.key() == signer.key();

        let recipient = ctx.accounts.recipient.key();

        require!(recipient != NULL_PUBKEY, NftokenError::TransferUnauthorized);
        require!(transfer_allowed, NftokenError::TransferUnauthorized);

        nft_account.holder = recipient;
        nft_account.delegate = NULL_PUBKEY;

        Ok(())
    }

    /// The delegate of an NFT is able to transfer the NFT once to another account.
    ///
    /// This is useful for NFT marketplaces and escrow accounts where the escrow account needs
    /// to be able to transfer the NFT on a sale completion.
    pub fn delegate_nft(
        ctx: Context<DelegateNft>,
        set_delegate: bool,
    ) -> Result<()> {
        let signer = &ctx.accounts.signer;
        let nft_account = &mut ctx.accounts.nft_account;

        if set_delegate {
            let action_allowed = nft_account.holder.key() == signer.key();
            require!(action_allowed, NftokenError::Unauthorized);

            let delegate = ctx.remaining_accounts[0].key();
            require!(delegate != NULL_PUBKEY, NftokenError::TransferUnauthorized);

            nft_account.delegate = delegate;
        } else {
            let current_delegate = &nft_account.delegate;
            let action_allowed =
                // The NFT holder can remove the delegate
                nft_account.holder.key() == signer.key()
                    // The delegate can also remove the delegate
                    || current_delegate.key() == signer.key();

            require!(action_allowed, NftokenError::DelegateUnauthorized);
            nft_account.delegate = NULL_PUBKEY;
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

        collection_account.creator = ctx.accounts.creator.key();
        collection_account.name = name;
        collection_account.image_url = image_url;
        collection_account.metadata_url = metadata_url;
        collection_account.creator_can_update = true;

        Ok(())
    }

    pub fn update_collection(
        ctx: Context<UpdateCollection>,
        name: [u8; 32],
        image_url: [u8; 128],
        metadata_url: [u8; 128],
        creator_can_update: bool
    ) -> Result<()> {
        return update_collection_inner(ctx, name, image_url, metadata_url, creator_can_update);
    }

    pub fn transfer_collection(ctx: Context<TransferCollection>) -> Result<()> {
        return transfer_collection_inner(ctx)
    }
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
