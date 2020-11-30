import React, { useEffect, useState } from 'react';
import { useWeb3Context } from 'web3-react';
import ConnectionBanner from '@rimble/connection-banner';

export default function Home() {
  const context = useWeb3Context();

  console.log(context);

  useEffect(() => {
    context.setFirstValidConnector(['MetaMask', 'Infura']);
  }, []);

  let p;

  if (!context.active && !context.error) {
    // loading
    p = <p>loading</p>;
  } else if (context.error) {
    //error
    p = <p>Error</p>;
  } else {
    // success
    p = <p>success,{context.account}</p>;
  }

  return (
    <>
      <ConnectionBanner
        currentNetwork={context.networkId}
        requiredNetwork={+process.env.REACT_APP_REQUIRED_NETWORK}
        onWeb3Fallback={!context.active && !context.error}
      >
        {/* {{
          notWeb3CapableBrowserMessage: (
            <div>
              <p>Not a web3 capable browser</p>
            </div>
          ),
          noNetworkAvailableMessage: (
            <div>
              <p>No Ethereum network available</p>
            </div>
          ),
          onWrongNetworkMessage: (
            <div>
              <p>On wrong Ethereum network</p>
            </div>
          ),
        }} */}
      </ConnectionBanner>
    </>
  );
}
