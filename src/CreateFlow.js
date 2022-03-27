import React, { useState, useEffect } from "react";
import { Framework } from "@superfluid-finance/sdk-core";
import {
  Button,
  Form,
  FormGroup,
  FormControl,
  Spinner,
  Card
} from "react-bootstrap";
import "./CreateFlow.css";
import { ethers } from "ethers";
// import abi from "./utils/StreamFlow.json";
import abi from "./utils/TestFlow.json";

// let account;

//where the Superfluid logic takes place

// creating a new flow when posted the doubt for the first time.
async function createNewFlow(recipient, flowRate, contractaddress, contractAbi) {

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chainId = await window.ethereum.request({ method: "eth_chainId" });

  const sf = await Framework.create({
    chainId: Number(chainId),
    provider: provider
  });

  const DAIx = "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90"; // DAIx address for Rinkeby

  try {
    const createFlowOperation = sf.cfaV1.createFlow({
      receiver: recipient,
      flowRate: flowRate,
      superToken: DAIx
      // userData?: string
    });

    console.log("Creating your stream...");

    const result = await createFlowOperation.exec(signer);
    console.log(result);

    console.log(
      `Congrats - you've just created a money stream!
    View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
    Network: Kovan
    Super Token: DAIx
    Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
    Receiver: ${recipient},
    FlowRate: ${flowRate}
    `
    );
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
}

async function updateExistingFlow(recipient, flowRate) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  const sf = await Framework.create({
    chainId: Number(chainId),
    provider: provider
  });

  const DAIx = "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90";
  
  try {
    const updateFlowOperation = sf.cfaV1.updateFlow({
      receiver: recipient,
      flowRate: flowRate,
      superToken: DAIx
      // userData?: string
    });

    console.log("Creating your stream...");

    const result = await updateFlowOperation.exec(signer);
    console.log(result);

    console.log(
      `Congrats - you've just updated a money stream!
    View Your Stream At: https://app.superfluid.finance/dashboard/${recipient}
    Network: Rinkeby
    Super Token: DAIx
    Sender: 0xDCB45e4f6762C3D7C61a00e96Fb94ADb7Cf27721
    Receiver: ${recipient},
    FlowRate: ${flowRate}
    `
    );
  } catch (error) {
    console.log(
      "Hmmm, your transaction threw an error. Make sure that this stream does not already exist, and that you've entered a valid Ethereum address!"
    );
    console.error(error);
  }
  
}



export const CreateFlow = () => {
  const [recipient, setRecipient] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [flowRate, setFlowRate] = useState("");
  const [flowRateDisplay, setFlowRateDisplay] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [doubt_heading, setDoubtHeading] = useState("");
  const [doubt_description, setDoubtDescription] = useState("");
  const [doubt_due, setDoubtDue] = useState(0);
  const [allDoubts, setAllDoubts] = useState([]);

  // const contractaddress = "0x42DAFAfe040af52B68b994d08A41DaB9Fb961806";
  const contractaddress = "0x91e42842F02982B7f7Aa0CA980F43C30c89742bD"; // this is only for testing. Use the above one while submitting the proejct.

  // const contractAbi = abi.abi; // use this while submitting the project.
  const contractAbi = abi; // this is only for testing usign remix

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts"
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      // let account = currentAccount;
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      // setupEventListener()
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    const chain = await window.ethereum.request({ method: "eth_chainId" });
    let chainId = chain;
    console.log("chain ID:", chain);
    console.log("global Chain Id:", chainId);
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      // setupEventListener()
    } else {
      console.log("No authorized account found");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  function calculateFlowRate(amount) {
    if (typeof Number(amount) !== "number" || isNaN(Number(amount)) === true) {
      alert("You can only calculate a flowRate based on a number");
      return;
    } else if (typeof Number(amount) === "number") {
      if (Number(amount) === 0) {
        return 0;
      }
      const amountInWei = ethers.BigNumber.from(amount);
      const monthlyAmount = ethers.utils.formatEther(amountInWei.toString());
      const calculatedFlowRate = monthlyAmount * 3600 * 24 * 30;
      return calculatedFlowRate;
    }
  }

  function CreateButton({ isLoading, children, ...props }) {
    return (
      <Button variant="success" className="button" {...props}>
        {isButtonLoading ? <Spinner animation="border" /> : children}
      </Button>
    );
  }

  const handleRecipientChange = (e) => {
    setRecipient(() => ([e.target.name] = e.target.value));
    console.log(setRecipient);
  };

  const handleFlowRateChange = (e) => {
    setFlowRate(() => ([e.target.name] = e.target.value));
    let newFlowRateDisplay = calculateFlowRate(e.target.value);
    setFlowRateDisplay(newFlowRateDisplay.toString());
  };

  const handleDoubtHeading = (e) => {
    setDoubtHeading(() => ([e.target.name] = e.target.value));    
    console.log(doubt_heading);
  }
  const handleDoubtDescription = (e) => {
    setDoubtDescription(() => ([e.target.name] = e.target.value));
  }
  const handleDoubtDue = (e) => {
    setDoubtDue(() => ([e.target.name] = e.target.value));
  }

  const getCurrentReceiver = async () => {
    const { ethereum } = window;
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const streamFlowContract = new ethers.Contract(
        contractaddress,
        contractAbi,
        signer
      );
      const current_receiver = await streamFlowContract.currentReceiver();
      console.log(current_receiver);
    }
  };

  // Get all the doubts
  const getDoubt = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const streamFlowContract = new ethers.Contract(
          contractaddress,
          contractAbi,
          signer
        );
        const postedDoubts = await streamFlowContract.readDoubts();
        const postedDoubtsCleaned = postedDoubts.map(postedDoubt => {
          return {
            address: postedDoubt.posterAddress,
            quesId: postedDoubt.quesId.toNumber(),
            heading: postedDoubt.heading,
            description: postedDoubt.description
          };
        });
        setAllDoubts(postedDoubtsCleaned);
        console.log(postedDoubtsCleaned);
        // console.log(allDoubts);
        
    } else {
      console.log("No Ethereum object found");
    }
  } catch (error) {
    console.log("There was some error while reading the Doubts");
    console.log(error);
  }
}

  useEffect(() => {
    let streamFlowContract;

    const onNewDoubt = (from, masterIndex, heading, description) => {
      console.log("NewDoubt", from, masterIndex, heading);
      setAllDoubts(prevState => [
        ...prevState,
        {
          address: from,
          quesId: masterIndex.toNumber(),
          heading: heading,
          description: description
        },
      ]);
      console.log(allDoubts);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      streamFlowContract = new ethers.Contract(contractaddress, contractAbi, signer);
      streamFlowContract = new ethers.providers.Web3Provider(window.ethereum);
      streamFlowContract.on("NewDoubt", onNewDoubt)
    }
    return () => {
      if (streamFlowContract) {
        streamFlowContract.off("NewDoubt", onNewDoubt);
      }
    };
  }, [allDoubts, contractAbi]);

  

  const postADoubt = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const streamFlowContract = new ethers.Contract(
          contractaddress,
          contractAbi,
          signer
        );
        const doubtTxn = await streamFlowContract.writeDoubt(
          doubt_heading,
          doubt_description,
          doubt_due,
          flowRate,
          {gasLimit: 300000}
        );
        console.log("Mining...", doubtTxn.hash);
        await doubtTxn.wait();
        console.log("Mined -- ", doubtTxn.hash);
        getDoubt();
      } else {
        console.log("Ethereum Object doesnot exist");
      }
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div>
      <h2>Create a Flow</h2>
      {currentAccount === "" ? (
        <button id="connectWallet" className="button" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <Card className="connectedWallet">
          {`${currentAccount.substring(0, 4)}...${currentAccount.substring(
            38
          )}`}
        </Card>
      )}
      <Form>
        <FormGroup class="mb-3">
          <FormControl
            name="recipient"
            value={recipient}
            onChange={handleRecipientChange}
            placeholder="Enter recipient address"
          ></FormControl>
        </FormGroup>
        <FormGroup className="mb-3">
          <FormControl
            name="flowRate"
            value={flowRate}
            onChange={handleFlowRateChange}
            placeholder="Enter a flowRate in wei/second"
          ></FormControl>
        </FormGroup>
        
        <CreateButton
          onClick={() => {
            setIsButtonLoading(true);
            updateExistingFlow(recipient, flowRate);
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}>
            Update Stream Flow
        </CreateButton>
      </Form>

      <div className="button">
        <button onClick={getCurrentReceiver}>Get current Receiver</button>
      </div>

      <div className="description">
        <p>
          Go to the CreateFlow.js component and look at the <b>createFlow() </b>
          function to see under the hood
        </p>
        <div className="calculation">
          <p>Your flow will be equal to:</p>
          <p>
            <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b> DAIx/month
          </p>
        </div>
      </div>

      <Form>
        <FormGroup class="mb-3">
          <FormControl
              name="doubt_heading"
              value={doubt_heading}
              onChange={handleDoubtHeading}
              placeholder="Enter the doubt heading"
            ></FormControl>
        </FormGroup>
        <FormGroup class="mb-3">
          <FormControl
              name="doubt_description"
              value={doubt_description}
              onChange={handleDoubtDescription}
              placeholder="Enter the doubt description"
            ></FormControl>
        </FormGroup>
        <FormGroup class="mb-3">
          <FormControl
              name="doubt_due"
              value={doubt_due}
              onChange={handleDoubtDue}
              placeholder="Enter the doubt due days"
            ></FormControl>
        </FormGroup>
        <CreateButton
          onClick={() => {
            setIsButtonLoading(true);
            createNewFlow(recipient, flowRate, contractaddress, contractAbi);
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}
        >
          Click to Create Your Stream
        </CreateButton>

        <CreateButton
          onClick={() => {
            setIsButtonLoading(true);
            postADoubt();
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}
        >
          Post a doubt
        </CreateButton>
      </Form>

      <div className="button">
        <button onClick={getDoubt}>Get the first doubt</button>
      </div>

    </div>
  );
};
