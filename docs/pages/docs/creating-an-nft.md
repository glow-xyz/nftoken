---
title: Creating an NFT
---

# {% $markdoc.frontmatter.title %}

You can create an NFT in just a couple lines of code with our [@glow-xyz/nftoken-js](https://www.npmjs.com/package/@glow-xyz/nftoken-js) library:

```ts
import { constructCreateNftTx } from "@glow-xyz/nftoken-js";

// This opens the Glow Chrome Extension and give us the current wallet
const { address: wallet } = await window.glow!.connect();

// This is the location where you have uploaded Metadata about the NFT. This can be in Arweave, IPFS, S3,
// or another storage service.
const metadata_url = "";

const { transactionBase64 } = await constructCreateNftTx({
  metadata_url,
  network,
  creator: wallet,
});

await window.glow!.signAndSendTransaction({
  transactionBase64,
  network: network,
});
```

All of the code for this site is Open Source. You can see the [code for this page on GitHub](https://github.com/glow-xyz/nftoken/blob/master/docs/components/CreateNftSection.tsx).
