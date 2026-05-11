import { useState } from "react";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import logo from "./assets/a.png";
import contractData from "./contract.json";

const contractAddress = contractData.address;

const abi = [
  "function createProject(string,string,uint256,uint256)",
  "function deposit(uint256) payable",
  "function publish(uint256)",
  "function release(uint256)",
  "function projects(uint256) view returns (address,string,string,uint256,uint256,address,uint8)",
  "function projectCount() view returns (uint256)"
];

const stateNames = ["Draft", "Funded", "Published", "Assigned", "Completed"];

export default function App() {
  const [account, setAccount] = useState("");
  const [page, setPage] = useState("list");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [deadline, setDeadline] = useState("");
  const [price, setPrice] = useState("");

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      toast.success("Wallet Connected 🔗");
      await loadProjects();
    } catch (err) {
      console.log(err);
      toast.error("Wallet connection failed");
    }
  }

  async function loadProjects() {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const count = await contract.projectCount();
      let temp = [];
      for (let i = 1; i <= Number(count); i++) {
        const p = await contract.projects(i);
        temp.push({
          id: i,
          owner: p[0],
          title: p[1],
          details: p[2],
          deadline: Number(p[3]),
          price: ethers.formatEther(p[4]),
          freelancer: p[5],
          state: Number(p[6])
        });
      }
      setProjects(temp);
      toast.success(`${temp.length} projects loaded`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function createProject() {
    try {
      if (!title || !details || !deadline || !price) {
        toast.error("Fill all fields");
        return;
      }
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + (Number(deadline) * 24 * 60 * 60);
      const tx = await contract.createProject(title, details, deadlineTimestamp, ethers.parseEther(price.toString()));
      await tx.wait();
      toast.success("Project Created 🟢");
      setTitle("");
      setDetails("");
      setDeadline("");
      setPrice("");
      setPage("list");
      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Creation Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  async function deposit(id, price) {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.deposit(id, { value: ethers.parseEther(price.toString()) });
      await tx.wait();
      toast.success("Deposited 💰");
      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Deposit Failed ❌");
    } finally {
      setLoading(false);
    }
  }

  async function publish(id) {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.publish(id);
      await tx.wait();
      toast.success("Published 🚀");
      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Publish Failed");
    } finally {
      setLoading(false);
    }
  }

  async function release(id) {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.release(id);
      await tx.wait();
      toast.success("Payment Released 💸");
      await loadProjects();
    } catch (err) {
      console.error(err);
      toast.error("Release Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <img src={logo} className="logo-img" alt="logo" />
      <div className="container">
        <div className="header">
          <h1>Freelance Escrow System</h1>
          <button className="primary small" onClick={connectWallet} disabled={loading}>
            {account ? `${account.slice(0,6)}...${account.slice(-4)}` : "Connect Wallet"}
          </button>
        </div>
        <div className="nav">
          <button onClick={() => setPage("list")} disabled={loading}>Projects</button>
          <button onClick={() => setPage("create")} disabled={loading}>Create</button>
        </div>
        {loading && <div style={{textAlign: "center", padding: "20px"}}>Loading...</div>}
        {page === "list" && !loading && (
          <div className="grid">
            {projects.length === 0 ? (
              <div style={{textAlign: "center", width: "100%"}}>No projects yet. Create one!</div>
            ) : (
              projects.map((p) => (
                <div className="card" key={p.id}>
                  <div className="cardHeader">
                    <h3>{p.title}</h3>
                    <span className="badge">{stateNames[p.state]}</span>
                  </div>
                  <p className="muted">{p.details}</p>
                  <div className="row">
                    <span>💰 {p.price} ETH</span>
                    <span>⏳ {Math.ceil((p.deadline - Date.now()/1000) / 86400)} days left</span>
                  </div>
                  <div className="actions">
                    {p.state === 0 && (
                      <button className="primary" onClick={() => deposit(p.id, p.price)} disabled={loading}>
                        💰 Deposit
                      </button>
                    )}
                    {p.state === 1 && (
                      <button className="primary" onClick={() => publish(p.id)} disabled={loading}>
                        📢 Publish
                      </button>
                    )}
                    {p.state === 3 && (
                      <button className="danger" onClick={() => release(p.id)} disabled={loading}>
                        💸 Release
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {page === "create" && !loading && (
          <div className="card form">
            <h2>Create Project</h2>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Details" value={details} onChange={(e) => setDetails(e.target.value)} />
            <input placeholder="Deadline (days)" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            <input placeholder="Price (ETH)" value={price} onChange={(e) => setPrice(e.target.value)} />
            <button className="primary" onClick={createProject} disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}