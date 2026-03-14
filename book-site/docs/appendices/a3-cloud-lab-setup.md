---
sidebar_position: 3
title: "Appendix C: Cloud Lab Setup"
description: "Setting up a cloud-based development environment for Isaac Sim, ROS 2, and GPU-accelerated robotics."
---

# Appendix C: Cloud Lab Setup

## Overview

Not every student has access to an NVIDIA RTX workstation. This appendix shows you how to set up a fully functional cloud-based lab for running Isaac Sim, training AI models, and developing ROS 2 applications using cloud GPU instances.

You will learn three approaches: NVIDIA Omniverse Cloud for Isaac Sim, a GPU cloud VM for general development, and Google Colab for notebook-based experiments.

**Who needs this:** Students without a Tier 2 GPU workstation (see [Appendix A](./a1-hardware-setup.md)), or anyone who wants a portable, reproducible environment.

**Estimated time:** 1--2 hours for initial setup.

## Prerequisites

- A web browser (Chrome or Firefox recommended)
- An NVIDIA account (free to create)
- A credit card for cloud VM providers (free tiers and credits are available)
- SSH client installed locally (`ssh` on Linux/macOS, or Windows Terminal with OpenSSH)

## C.1 NVIDIA Omniverse Cloud for Isaac Sim

NVIDIA offers Isaac Sim as a cloud-streamed application through Omniverse Cloud. This is the most straightforward way to run Isaac Sim without local GPU hardware.

### Step 1: Create an NVIDIA Account

1. Go to [https://developer.nvidia.com/](https://developer.nvidia.com/)
2. Click **"Join"** or **"Log In"** and create a free developer account
3. Verify your email address

### Step 2: Access Omniverse Cloud

1. Navigate to [https://www.nvidia.com/en-us/omniverse/](https://www.nvidia.com/en-us/omniverse/)
2. Click **"Try Now"** or **"Get Started Free"**
3. Sign in with your NVIDIA developer account

:::tip Free Tier Availability
NVIDIA periodically offers free trial access to Omniverse Cloud. Check the Omniverse Cloud page for current availability. If no free tier is available, see Section C.2 for alternative GPU cloud options.
:::

### Step 3: Launch Isaac Sim in the Browser

1. From the Omniverse Cloud dashboard, select **"Isaac Sim"** from the application list
2. Choose a GPU instance size (the smallest available is sufficient for learning)
3. Click **"Launch"** -- the application will start streaming to your browser within 2--5 minutes

Once loaded, you will see the Isaac Sim viewport in your browser. You can:
- Load robot models (URDF/USD)
- Create simulation environments
- Run ROS 2 bridge connections

### Step 4: Connect Your Local ROS 2 to Cloud Isaac Sim

Isaac Sim in the cloud can communicate with your local ROS 2 installation using the ROS 2 bridge over a network. You need to set up a secure tunnel.

On your local machine, configure the DDS discovery to work over the tunnel:

```bash
# Install the ROS 2 Humble bridge package (on your local Ubuntu)
sudo apt install -y ros-humble-ros-gz-bridge

# Set the ROS_DOMAIN_ID to match the cloud instance
export ROS_DOMAIN_ID=42
```

:::caution DDS Over the Internet
By default, ROS 2 uses multicast UDP for node discovery, which does not work across the internet. For cloud-to-local communication, you must configure one of:
1. **Zenoh bridge** (recommended): A ROS 2 middleware that works over TCP
2. **CycloneDDS with XML config**: Manual unicast peer configuration
3. **SSH tunnel with port forwarding**: Forward DDS ports through SSH

The Zenoh approach is simplest. Install it with:
```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
```
:::

## C.2 GPU Cloud VM Setup

For full control over your development environment, you can provision a GPU cloud VM. This section covers setup on Lambda Labs (GPU-focused, simple pricing) and general steps that apply to AWS, GCP, or Azure.

### Option A: Lambda Labs GPU Cloud

Lambda Labs provides on-demand GPU instances with Ubuntu and NVIDIA drivers pre-installed.

**Step 1: Create an Account**

1. Go to [https://lambdalabs.com/service/gpu-cloud](https://lambdalabs.com/service/gpu-cloud)
2. Create an account and add a payment method
3. Current pricing is approximately $1.10/hour for an A10G instance (24 GB VRAM)

**Step 2: Generate SSH Keys**

```bash
# On your local machine, generate an SSH key if you don't have one
ssh-keygen -t ed25519 -C "robotics-lab" -f ~/.ssh/lambda_key
cat ~/.ssh/lambda_key.pub
```

Expected output:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... robotics-lab
```

Copy the public key and add it to your Lambda Labs account under **SSH Keys** in the dashboard.

**Step 3: Launch an Instance**

1. Select **"1x A10 (24 GB)"** -- this is sufficient for Isaac Sim and model training
2. Choose **Ubuntu 22.04** as the OS
3. Select your SSH key
4. Click **"Launch instance"**

**Step 4: Connect via SSH**

```bash
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE_IP>
```

Expected output:
```
Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-xxx-generic x86_64)
...
ubuntu@lambda-instance:~$
```

**Step 5: Install ROS 2 on the Cloud VM**

Once connected, follow the same ROS 2 Humble installation steps from [Appendix B](./a2-software-installation.md), Sections B.2 through B.4. Lambda instances come with NVIDIA drivers and CUDA pre-installed, so you can skip Section B.5.

Verify the GPU is available:

```bash
nvidia-smi
```

Expected output:
```
+-----------------------------------------------------------------------------+
| NVIDIA A10G 24GB                                                            |
+-----------------------------------------------------------------------------+
```

### Option B: Google Cloud Platform (GCP)

GCP offers $300 in free credits for new accounts, enough for approximately 60--100 hours of GPU time.

1. Go to [https://cloud.google.com/free](https://cloud.google.com/free) and activate your free trial
2. Create a VM instance in Compute Engine:
   - Machine type: `n1-standard-8` with 1x NVIDIA T4 GPU
   - Boot disk: Ubuntu 22.04 LTS, 200 GB SSD
   - Allow HTTP/HTTPS traffic
3. SSH into the instance from the GCP console or via `gcloud compute ssh`

### Cost Estimation

| Provider | GPU | VRAM | Approx. Cost/Hour | 120 Hours (1 Quarter) |
|----------|-----|------|-------------------|-----------------------|
| Lambda Labs | A10G | 24 GB | $1.10 | $132 |
| AWS (g5.2xlarge) | A10G | 24 GB | $1.50 | $180 |
| GCP (T4) | T4 | 16 GB | $0.95 | $114 |
| GCP (free credits) | T4 | 16 GB | $0 (first $300) | $0 |

:::tip Cost-Saving Strategy
1. **Stop instances when not in use.** Cloud VMs bill per-second while running.
2. **Use spot/preemptible instances** for training workloads (50--70% cheaper).
3. **Train in the cloud, infer on Jetson.** Download model weights to your local Jetson kit for deployment.
:::

## C.3 Google Colab for Notebook Experiments

For lightweight experiments, data exploration, and model prototyping, Google Colab provides free GPU access directly in your browser.

### Step 1: Open Google Colab

1. Go to [https://colab.research.google.com/](https://colab.research.google.com/)
2. Sign in with your Google account

### Step 2: Enable GPU Runtime

1. Click **Runtime** > **Change runtime type**
2. Select **"T4 GPU"** from the Hardware accelerator dropdown
3. Click **"Save"**

### Step 3: Verify GPU Access

Run this cell in a Colab notebook:

```python
!nvidia-smi
```

Expected output:
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.104.05   Driver Version: 535.104.05   CUDA Version: 12.2     |
|   0  Tesla T4            16384MiB                                            |
+-----------------------------------------------------------------------------+
```

### Step 4: Install ROS 2 in Colab (Limited)

While Colab is not designed for ROS 2, you can install it for basic experiments:

```python
%%bash
sudo apt update -qq
sudo apt install -y -qq software-properties-common curl gnupg2
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update -qq
sudo apt install -y -qq ros-humble-ros-base python3-colcon-common-extensions
```

:::warning Colab Limitations
Google Colab is useful for prototyping but has significant limitations:
- Sessions timeout after 90 minutes of inactivity (12 hours max)
- No persistent filesystem (files are lost when the session ends)
- Limited to `ros-humble-ros-base` (no GUI tools like RViz)
- No Gazebo or Isaac Sim support

Use Colab for Python-based exercises (kinematics, computer vision, model inference) and a full cloud VM for simulation work.
:::

## C.4 Configuring SSH Tunnels for Remote ROS 2

When running ROS 2 on a cloud VM, you may want to visualize topics locally using RViz or other GUI tools. SSH tunneling enables this.

### Forward ROS 2 DDS Traffic Over SSH

```bash
# On your local machine, create an SSH tunnel forwarding DDS ports
# Port 7400-7500 are typically used by DDS discovery and data
ssh -i ~/.ssh/lambda_key -L 7400:localhost:7400 -L 7401:localhost:7401 \
  ubuntu@<INSTANCE_IP>
```

### Use Zenoh for Reliable Cloud-Local Communication

Zenoh is the most reliable method for ROS 2 communication between cloud and local machines.

On the **cloud VM**:

```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp

# Start a Zenoh router
ros2 run rmw_zenoh_cpp zenoh_router
```

On your **local machine**:

```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp

# Configure the Zenoh router address (replace with your cloud VM IP)
export ZENOH_ROUTER=tcp/<INSTANCE_IP>:7447
```

Now ROS 2 topics published on the cloud VM will be visible on your local machine, and vice versa.

## C.5 Accessing Isaac Sim via Web Browser

If you install Isaac Sim on a cloud VM (rather than using Omniverse Cloud), you can stream the viewport to your browser using NVIDIA's built-in streaming.

### Install Isaac Sim on the Cloud VM

```bash
# On the cloud VM (requires A10G or better GPU)
# Download the Isaac Sim AppImage from NVIDIA
# Follow the instructions at: https://docs.omniverse.nvidia.com/isaacsim/latest/installation/install_workstation.html

# Launch Isaac Sim with streaming enabled
./isaac-sim.sh --enable-livestream --livestream-port 8211
```

### Connect from Your Browser

1. Open your browser and navigate to `http://<INSTANCE_IP>:8211/streaming/client`
2. You should see the Isaac Sim viewport rendered in real-time

:::tip Firewall Rules
Ensure port 8211 is open in your cloud provider's firewall/security group settings. On Lambda Labs, all ports are open by default. On AWS/GCP, you must explicitly add an inbound rule for TCP port 8211.
:::

For more details on Isaac Sim, see [Chapter 8: NVIDIA Isaac Platform](/docs/module-3/ch08-nvidia-isaac).

## Verification

Run these checks to confirm your cloud environment is operational.

```bash
# 1. Verify SSH connection
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE_IP> "echo 'SSH: OK'"
```

Expected output:
```
SSH: OK
```

```bash
# 2. Verify GPU on cloud VM (run on the VM)
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
```

Expected output:
```
NVIDIA A10G, 24576 MiB
```

```bash
# 3. Verify ROS 2 on cloud VM
ros2 doctor --report | head -5
```

Expected output:
```
NETWORK CONFIGURATION
...
```

```bash
# 4. Test local-to-cloud ROS 2 communication
# On cloud VM:
ros2 run demo_nodes_cpp talker

# On local machine (in a separate terminal):
ros2 run demo_nodes_py listener
# Should see "I heard: Hello World: X" messages
```

## Troubleshooting

### Problem 1: SSH connection refused

**Cause:** The instance may not have started, or the SSH port (22) is blocked.

**Fix:**
```bash
# Check that the instance is running in your cloud dashboard
# Verify the IP address is correct
# Test connectivity:
ping <INSTANCE_IP>

# If ping works but SSH does not, check the firewall:
# Lambda Labs: SSH is open by default
# AWS: Check Security Group for port 22 inbound rule
# GCP: Check Firewall Rules for ssh-allow
```

### Problem 2: NVIDIA driver not found on cloud VM

**Cause:** Some cloud images do not include pre-installed NVIDIA drivers.

**Fix:**
```bash
# Install NVIDIA driver on the cloud VM
sudo apt update
sudo apt install -y nvidia-driver-535
sudo reboot
# Reconnect via SSH after reboot
nvidia-smi
```

### Problem 3: ROS 2 topics not visible between cloud and local machine

**Cause:** DDS multicast does not work across networks.

**Fix:** Use the Zenoh bridge as described in Section C.4. Alternatively, configure CycloneDDS with explicit peer addresses:

```bash
# Create a CycloneDDS config file
cat > ~/cyclonedds.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<CycloneDDS xmlns="https://cdds.io/config">
  <Domain>
    <General>
      <Interfaces>
        <NetworkInterface autodetermine="true" />
      </Interfaces>
    </General>
    <Discovery>
      <Peers>
        <Peer address="<REMOTE_IP>"/>
      </Peers>
    </Discovery>
  </Domain>
</CycloneDDS>
EOF

export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export CYCLONEDDS_URI=file://$HOME/cyclonedds.xml
```

### Problem 4: Isaac Sim streaming shows a black screen

**Cause:** The GPU may not be rendering correctly, or the streaming port is blocked.

**Fix:**
1. Verify the GPU is not overloaded: `nvidia-smi` should show memory usage below 90%
2. Check that port 8211 is open in your firewall settings
3. Try a different browser (Chrome works best with WebRTC streaming)
4. Restart Isaac Sim with verbose logging:
```bash
./isaac-sim.sh --enable-livestream --livestream-port 8211 --verbose
```

## Next Steps

With your cloud lab configured, you can proceed to any chapter in the textbook. For Isaac Sim exercises specifically, see [Chapter 8: NVIDIA Isaac Platform](/docs/module-3/ch08-nvidia-isaac). For deploying trained models to physical hardware, see [Appendix D: NVIDIA Jetson Deployment](./a4-jetson-deployment.md).
