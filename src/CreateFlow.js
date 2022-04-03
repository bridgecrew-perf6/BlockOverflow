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
import Modal from "react-bootstrap/Modal";
import "./CreateFlow.css";
import { ethers } from "ethers";
import abi from "./utils/StreamFlow.json";
// import abi from "./utils/TestFlow.json";

// let account;

//where the Superfluid logic takes place

// creating a new flow when posted the doubt for the first time.
async function createNewFlow(recipient, flowRate) {

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
    Network: Rinkeby
    Super Token: DAIx
    Sender: 
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

    console.log("Updating your stream...");

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

  var modal = document.getElementById("myModal");
  var modal2 = document.getElementById("myModal2")


  const [recipient, setRecipient] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [flowRate, setFlowRate] = useState("");
  const [flowRateDisplay, setFlowRateDisplay] = useState("");
  const [doubtFlowRateDisplay, setDoubtFlowRateDisplay] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [doubt_heading, setDoubtHeading] = useState("");
  const [doubt_description, setDoubtDescription] = useState("");
  const [doubt_due, setDoubtDue] = useState(0);
  const [allDoubts, setAllDoubts] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // for the modal
  const [answerBody, setAnswerBody] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [currentDoubtAnsweringId, setCurrentDoubtAnsweringId] = useState(0);


  const contractaddress = "0x9FC6B3F3666cBaF8E37948B05C4aB680Eb0988B4";
  // const contractaddress = "0x0FE62c7A782c050Cafe8020Ce138c59657F04B48";

  const contractAbi = abi.abi; // use this while submitting the project.
  // const contractAbi = abi; // this is only for testing usign remix

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
      getDoubt();
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
    setFlowRateDisplay(newFlowRateDisplay.toString()); // this is for monthly cost
    let doubtFlowRate = (newFlowRateDisplay * doubt_due) / 30;
    setDoubtFlowRateDisplay(doubtFlowRate.toString()); // this is cost per due days.
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

  // for answers
  const handleAnswers = (e) => {
    setAnswerBody(() => ([e.target.name] = e.target.value));
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

  async function getAnswer(qId) {
    console.log("getAnswer called with id ", qId);
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
        const postedAnswers = await streamFlowContract.readAnsS(qId);
        const postedAnswersCleaned = postedAnswers.map(postedAnswer => {
          return {
            address: postedAnswer.answerer,
            ansId: postedAnswer.ansId.toNumber(),
            answerbody: postedAnswer.ans,
            upvotes: postedAnswer.upvotes.toNumber()
          };
        });
        setAllAnswers(postedAnswersCleaned);
        console.log(postedAnswersCleaned);
      } else {
        console.log("Etereum Object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    let streamFlowContract;
    const onNewAnswer = (from, answerid, qid, ans, upvotes) => {
      console.log("New Answer", from, answerid, ans);
      setAllAnswers(prevState => [
        ...prevState,
        {
          address: from,
          ansId: answerid.toNumber(),
          ans: ans,
          upvotes: upvotes.toNumber()
        },
      ]);
      console.log(allAnswers);
    };
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      streamFlowContract = new ethers.Contract(contractaddress, contractAbi, signer);
      streamFlowContract = new ethers.providers.Web3Provider(window.ethereum);
      streamFlowContract.on("NewUpdateAnswer", onNewAnswer);
    }
    return () => {
      if (streamFlowContract) {
        streamFlowContract.off("NewUpdateAnswer", onNewAnswer);
      }
    };
  }, [allAnswers, contractAbi]);

  useEffect(() => {
    let streamFlowContract;
    // event fired on successful posting of a new Doubt
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
    }; // Team name AdEth

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      streamFlowContract = new ethers.Contract(contractaddress, contractAbi, signer);
      streamFlowContract = new ethers.providers.Web3Provider(window.ethereum);
      streamFlowContract.on("NewDoubt", onNewDoubt);
    }
    return () => {
      if (streamFlowContract) {
        streamFlowContract.off("NewDoubt", onNewDoubt);
      }
    };
  }, [allDoubts, contractAbi]);


  // function to post a doubt
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
          flowRate
        );
        console.log("Mining...", doubtTxn.hash);
        await doubtTxn.wait();
        console.log("Mined -- ", doubtTxn.hash); // doubt posted
        await getDoubt();
        let currentFlowRate = await getAFlow();
        console.log(currentFlowRate);
        // const transactionExist = await streamFlowContract.checkFlow(currentAccount);
        if (flowRate > 0) {
          if (currentFlowRate != 0) {
            // try {
            //   let newflowrate = currentFlowRate + Number(flowRate);
            //   await updateExistingFlow(contractaddress, newflowrate.toString());
            // } catch (error) {
            //   console.log("Error for updating flow" + error);
            // }
            console.log("Posting doubt without bounty, you already have a bounty doubt posted!");
          }
          if (currentFlowRate == 0) {
            createNewFlow(contractaddress, flowRate);
          }
        }
        // createNewFlow(contractaddress, flowRate);
      } else {
        console.log("Ethereum Object doesnot exist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const postAnswer = async () => {
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
        const answerTxn = await streamFlowContract.answerDoubt(
          answerBody,
          currentDoubtAnsweringId,
        );
        console.log("Mining...", answerTxn.hash);
        await answerTxn.wait();
        console.log("Mined -- ", answerTxn.hash); // answer posted
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getAFlow = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        // const provider = new ethers.providers.Web3Provider(ethereum);
        const provider = new ethers.providers.AlchemyProvider("rinkeby", "iNNs24vbZthCgoM1DdYfs44KxP-re35d");
        // const signer = provider.getSigner();
        const chainId = await window.ethereum.request({ method: "eth_chainId" });

        const sf = await Framework.create({
          chainId: Number(chainId),
          provider: provider
        });
        const myflow = await sf.cfaV1.getFlow({
          superToken: "0x745861AeD1EEe363b4AaA5F1994Be40b1e05Ff90",
          sender: currentAccount.toString(),
          receiver: contractaddress,
          providerOrSigner: provider
        });
        console.log(myflow); // now getting the flow.
        console.log(Number(myflow.flowRate))
        return Number(myflow.flowRate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function upvoteCurrentAnswer(ansId) {
    console.log(currentDoubtAnsweringId);
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
        const upvoteTxn = await streamFlowContract.upVote(
          currentDoubtAnsweringId,
          ansId,
        );
        console.log("Mining...", upvoteTxn.hash);
        await upvoteTxn.wait();
        console.log("Mined -- ", upvoteTxn.hash); // answer posted
      } else {
        console.log("Ethereum object not found");
      }
    } catch (error) {
      console.log(error);
    }
  }


  const showModal = () => {
    setIsOpen(true);
  };
  const hideModal = () => {
    setIsOpen(false);
  };

  async function openModal(quesId) {
    setCurrentDoubtAnsweringId(quesId);
    await getAnswer(quesId);
    modal.style.display = "block";
  }

  async function openModal2(quesId) {
    setCurrentDoubtAnsweringId(quesId);
    console.log(currentDoubtAnsweringId);
    modal2.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
  }

  function closeModal2() {
    modal2.style.display = "none";
  }

  // UI code
  return (
    <div>
      <h2>BlockOverFlow</h2>
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



      {/* <div className="button">
        <button onClick={getCurrentReceiver}>Get current Receiver</button>
      </div> */}

      {/* <div className="button">
        <button onClick={getAFlow}>Get A Flow</button>
      </div> */}

      <Form>
        <FormGroup class="mb-3">
          <p>Enter the Doubt Heading</p>
          <FormControl
            name="doubt_heading"
            value={doubt_heading}
            onChange={handleDoubtHeading}
            placeholder="Enter the doubt heading"
          ></FormControl>
        </FormGroup>
        <FormGroup class="mb-3">
          <p>Enter the Dount description</p>
          <FormControl
            name="doubt_description"
            value={doubt_description}
            onChange={handleDoubtDescription}
            placeholder="Enter the doubt description"
          ></FormControl>
        </FormGroup>
        <FormGroup class="mb-3">
          <p>Enter the due days until the bounty is valid</p>
          <FormControl
            name="doubt_due"
            value={doubt_due}
            onChange={handleDoubtDue}
            placeholder="Enter the doubt due days"
          ></FormControl>
        </FormGroup>

        {/* displaying flowRate */}
        <FormGroup className="mb-3">
          <p>Enter the bounty of your doubt (optional)</p>
          <FormControl
            name="flowRate"
            value={flowRate}
            onChange={handleFlowRateChange}
            placeholder="Enter a bounty amount in wei/second"
          ></FormControl>
        </FormGroup>

        <div className="description">
          <div className="calculation">
            <p>Bounty flow Rate with Superfluid</p>
            <p>
              <b>${flowRateDisplay !== " " ? flowRateDisplay : 0}</b> DAIx/month<br></br>
              <b>${doubtFlowRateDisplay !== " " ? doubtFlowRateDisplay : 0}</b> DAIx/{doubt_due} day(s)
            </p>
          </div>
        </div>

        <CreateButton
          onClick={() => {
            setIsButtonLoading(true);
            postADoubt();
            setTimeout(() => {
              setIsButtonLoading(false);
            }, 1000);
          }}
        >
          Post doubt
        </CreateButton>
      </Form>

      {/* <div className="button">
        <button onClick={getDoubt}>Get the first doubt</button>
      </div> */}

      <div className="answer">
        <button onClick={getAnswer}>Get the answer of first doubt</button>
      </div>


      {/* making modal */}

      <button onClick={showModal}>Display Modal</button>

      <Modal show={isOpen} onHide={hideModal}>
        <Modal.Header>
          <Modal.Title>Modal title</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Modal body text goes here.</p>
          <Form>
            <FormGroup className="mb-3">
              <FormControl
                name="answerBody"
                value={answerBody}
                onChange={handleAnswers}
                placeholder="Enter the answer for this doubt"
              ></FormControl>
              <FormControl
                name="doubt_due"
                value={doubt_due}
                onChange={handleDoubtDue}
                placeholder="Enter the doubt number which you want to answer"></FormControl>
            </FormGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <button onClick={hideModal}>Cancle</button>
          <CreateButton
            onClick={() => {
              setIsButtonLoading(true);
              postAnswer();
              setTimeout(() => {
                setIsButtonLoading(false);
              }, 1000);
            }}
          >
            Post an Answer
          </CreateButton>
        </Modal.Footer>
      </Modal>

      {allDoubts.map((doubt, index) => {
        return (
          <div className="card" key={index}>
            <div className="container">
              {/* <h3>Address: {doubt.address}</h3> */}
              <h3><b>Heading: {doubt.heading}</b></h3>
              <p>Description: {doubt.description}</p>
              <p>Ques_ID: {doubt.quesId.toString()}</p>

              <button id="modalButton" onClick={() => openModal(doubt.quesId)}>Show Answers</button>
              <button id="modalButton2" onClick={() => openModal2(doubt.quesId)}>Answer Question</button>
            </div>
          </div>
        )
      })}

      {/* for answers */}
      <div id="myModal" className="modal">
        <div className="modal-content">
          <h3>Answers</h3>
          <span onClick={closeModal} id="closeSpanButton" className="close">&times;</span>

          {allAnswers.map((answer, index) => {
            return (
              <div key={index}>
                <span className="totalUpvotes">{answer.upvotes}</span>&nbsp;
                <button onClick={() => { upvoteCurrentAnswer(answer.ansId) }} className="upvoteArrow">&#8679;</button>
                &nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
                <span className="answerBody">Answer {answer.ansId}:- {answer.answerbody}</span>
                <hr></hr>
                <br></br>
              </div>
            )
          })}
        </div>
      </div>

      {/* Posting answers */}
      <div id="myModal2" className="modal2">
        <div className="modal-content">
          <span onClick={closeModal2} id="closeSpanButton" className="close">&times;</span>
          <h3>Type your answer</h3>
          <Form>
            <FormGroup className="mb-3">
              <FormControl
                name="answerBody"
                value={answerBody}
                onChange={handleAnswers}
                placeholder="Enter the answer for this doubt"
              ></FormControl>
              {/* <FormControl
                name="doubt_due"
                value={doubt_due}
                onChange={handleDoubtDue}
                placeholder="Enter the doubt number which you want to answer"></FormControl> */}
            </FormGroup>
            <CreateButton
              onClick={() => {
                setIsButtonLoading(true);
                postAnswer();
                setTimeout(() => {
                  setIsButtonLoading(false);
                }, 1000);
              }}
            >
              Post an Answer
            </CreateButton>
          </Form>
        </div>
      </div>

    </div>
  );
};
