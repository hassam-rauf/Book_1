---
sidebar_position: 2
title: "Appendix B: Software Installation Guide"
description: "Step-by-step installation of Ubuntu 22.04, ROS 2 Humble, Gazebo Harmonic, and Python dependencies."
---

# Appendix B: Software Installation Guide

## Overview

This appendix provides the complete, step-by-step installation process for every piece of software you need to follow along with this textbook. You will install Ubuntu 22.04, ROS 2 Humble, Gazebo Harmonic, and the Python scientific libraries used throughout the course.

**Who needs this:** Every reader. Even if you already have Ubuntu installed, review the ROS 2 and Gazebo sections to ensure your environment matches the textbook's expectations.

**Estimated time:** 1--2 hours depending on internet speed.

## Prerequisites

- A computer meeting the **Tier 1** or **Tier 2** hardware requirements from [Appendix A: Hardware Setup Guide](./a1-hardware-setup.md)
- A stable internet connection (you will download approximately 2--3 GB of packages)
- A USB drive (8 GB+) if installing Ubuntu from scratch
- Administrator (sudo) access on your machine

## B.1 Installing Ubuntu 22.04 LTS

### Option A: Native Installation (Recommended)

If you are setting up a dedicated machine or dual-booting, download and install Ubuntu 22.04 LTS.

1. Download the ISO from [https://releases.ubuntu.com/22.04/](https://releases.ubuntu.com/22.04/)
2. Create a bootable USB drive using [Balena Etcher](https://etcher.balena.io/) or the `dd` command
3. Boot from the USB and follow the graphical installer
4. Select **"Install Ubuntu"** and choose **"Erase disk and install"** (or manual partitioning for dual-boot)
5. Set your username, hostname, and password

After installation, update your system:

```bash
sudo apt update && sudo apt upgrade -y
```

Expected output (last few lines):
```
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.
```

### Option B: WSL2 on Windows (Alternative for Modules 1--2)

If you are on Windows 10/11 and do not want to dual-boot, WSL2 provides a Linux environment adequate for ROS 2 development. Note that GPU passthrough for Isaac Sim on WSL2 is experimental and not recommended for Modules 3--4.

```bash
# Run this in PowerShell as Administrator
wsl --install -d Ubuntu-22.04
```

Expected output:
```
Installing: Ubuntu 22.04 LTS
Ubuntu 22.04 LTS has been installed.
```

After installation completes, a new terminal window will open prompting you to create a UNIX username and password. Then update packages:

```bash
sudo apt update && sudo apt upgrade -y
```

:::caution WSL2 Limitations
WSL2 works well for ROS 2 nodes, topic communication, and basic Gazebo (headless mode). However, it has limited support for GUI applications and no reliable GPU passthrough for Isaac Sim. For Modules 3--4, use a native Ubuntu installation or a cloud lab (see [Appendix C](./a3-cloud-lab-setup.md)).
:::

### Install Essential Build Tools

Regardless of which option you chose, install these baseline development tools:

```bash
sudo apt install -y build-essential cmake git curl wget \
  software-properties-common lsb-release gnupg2
```

Expected output (last line):
```
Processing triggers for man-db (2.10.2-1) ...
```

## B.2 Installing ROS 2 Humble

ROS 2 Humble Hawksbill is the Long-Term Support (LTS) release for Ubuntu 22.04. The following steps follow the [official ROS 2 Humble installation guide](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html).

### Step 1: Set Locale

```bash
locale  # check for UTF-8

sudo apt update && sudo apt install -y locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

locale  # verify settings
```

Expected output (should include):
```
LANG=en_US.UTF-8
```

### Step 2: Enable Required Repositories

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository universe
```

Expected output:
```
'universe' distribution component enabled for all sources.
```

### Step 3: Add the ROS 2 GPG Key

```bash
sudo apt update && sudo apt install -y curl
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

No output is expected if the command succeeds.

### Step 4: Add the ROS 2 Repository

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

### Step 5: Install ROS 2 Humble Desktop

```bash
sudo apt update
sudo apt install -y ros-humble-desktop
```

This downloads approximately 1.5 GB of packages. Expected output (last few lines):
```
Setting up ros-humble-desktop ...
Processing triggers for libc-bin (2.35-0ubuntu3.8) ...
```

:::tip Desktop vs Base
The `ros-humble-desktop` meta-package includes RViz, demo nodes, and GUI tools. If you are on a headless server or WSL2, you can install the smaller `ros-humble-ros-base` instead, but you will miss the visualization tools used in the exercises.
:::

### Step 6: Install Development Tools

```bash
sudo apt install -y ros-dev-tools
```

Expected output:
```
Setting up ros-dev-tools ...
```

### Step 7: Source the ROS 2 Setup Script

```bash
source /opt/ros/humble/setup.bash
```

To make this automatic for every new terminal session, add it to your shell configuration:

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### Step 8: Verify ROS 2 Installation

Open **two** terminal windows. In the first terminal, run:

```bash
ros2 run demo_nodes_cpp talker
```

Expected output:
```
[INFO] [1234567890.123456789] [talker]: Publishing: 'Hello World: 1'
[INFO] [1234567890.234567890] [talker]: Publishing: 'Hello World: 2'
[INFO] [1234567890.345678901] [talker]: Publishing: 'Hello World: 3'
```

In the second terminal, run:

```bash
ros2 run demo_nodes_py listener
```

Expected output:
```
[INFO] [1234567890.123456789] [listener]: I heard: [Hello World: 1]
[INFO] [1234567890.234567890] [listener]: I heard: [Hello World: 2]
```

If you see messages flowing between the talker and listener, ROS 2 is installed correctly. Press `Ctrl+C` in both terminals to stop.

## B.3 Installing Gazebo Harmonic

Gazebo Harmonic is the recommended simulation engine for use with ROS 2 Humble. The following steps install Gazebo and the ROS 2 integration bridge.

### Step 1: Install Gazebo Harmonic

```bash
sudo apt install -y wget
sudo wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null
sudo apt update
sudo apt install -y gz-harmonic
```

Expected output (last line):
```
Setting up gz-harmonic ...
```

### Step 2: Install the ROS 2--Gazebo Bridge

The bridge package allows ROS 2 topics and Gazebo transport to communicate seamlessly.

```bash
sudo apt install -y ros-humble-ros-gz
```

Expected output:
```
Setting up ros-humble-ros-gz ...
```

### Step 3: Verify Gazebo Installation

```bash
gz sim --version
```

Expected output:
```
Gazebo Sim, version 8.x.x
```

Launch a test world:

```bash
gz sim shapes.sdf
```

A Gazebo window should open showing a ground plane with basic geometric shapes. Close the window when done.

:::tip Headless Testing
If you are on WSL2 or a headless server, you can run Gazebo in server-only mode for testing:
```bash
gz sim -s shapes.sdf
```
This runs the physics simulation without rendering a GUI window.
:::

## B.4 Installing Python Dependencies

The textbook uses several Python packages for robotics algorithms, computer vision, and kinematics.

### Step 1: Install pip

```bash
sudo apt install -y python3-pip python3-venv
```

### Step 2: Create a Virtual Environment (Recommended)

```bash
python3 -m venv ~/ros2_venv
source ~/ros2_venv/bin/activate
```

:::caution Virtual Environment and ROS 2
When using a virtual environment, you must source both the ROS 2 setup and the venv activation. Add both to your `.bashrc` if desired:
```bash
echo "source ~/ros2_venv/bin/activate" >> ~/.bashrc
```
Note that some ROS 2 Python packages installed via `apt` (like `rclpy`) live in the system Python path. If you encounter import errors for `rclpy` inside a venv, use `--system-site-packages`:
```bash
python3 -m venv ~/ros2_venv --system-site-packages
```
:::

### Step 3: Install Required Python Packages

```bash
pip install numpy opencv-python ikpy matplotlib scipy transforms3d
```

Expected output (last lines):
```
Successfully installed numpy-1.26.4 opencv-python-4.10.0.84 ikpy-3.3.4 ...
```

**Package purposes:**

| Package | Used In | Purpose |
|---------|---------|---------|
| `numpy` | All modules | Array math, linear algebra |
| `opencv-python` | Modules 3--4 | Computer vision, image processing |
| `ikpy` | Module 4 | Inverse kinematics for robot arms |
| `matplotlib` | All modules | Plotting and visualization |
| `scipy` | Module 4 | Optimization, spatial transforms |
| `transforms3d` | Modules 2--4 | 3D rotation and transformation utilities |

### Step 4: Verify Python Packages

```bash
python3 -c "
import numpy as np
import cv2
import ikpy
print(f'NumPy:   {np.__version__}')
print(f'OpenCV:  {cv2.__version__}')
print(f'IKPy:    {ikpy.__version__}')
print('All packages imported successfully.')
"
```

Expected output:
```
NumPy:   1.26.4
OpenCV:  4.10.0
IKPy:    3.3.4
All packages imported successfully.
```

## B.5 Installing NVIDIA Drivers and CUDA (Tier 2 Only)

If you have an NVIDIA GPU and plan to run Isaac Sim (Modules 3--4), install the NVIDIA driver and CUDA toolkit.

```bash
# Install the recommended NVIDIA driver
sudo apt install -y nvidia-driver-535

# Reboot to load the driver
sudo reboot
```

After reboot:

```bash
# Verify driver installation
nvidia-smi
```

Expected output: A table showing your GPU name, driver version, and CUDA version.

```bash
# Install CUDA toolkit (required for Isaac Sim and TensorRT)
sudo apt install -y nvidia-cuda-toolkit
nvcc --version
```

Expected output:
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2023 NVIDIA Corporation
Built on ...
Cuda compilation tools, release 12.2, V12.2.xxx
```

## Verification

Run this comprehensive verification script to confirm your entire software stack is ready.

```bash
echo "=== OS ==="
lsb_release -d

echo ""
echo "=== ROS 2 ==="
ros2 --version 2>/dev/null && echo "ROS 2: OK" || echo "ROS 2: NOT FOUND"

echo ""
echo "=== Gazebo ==="
gz sim --version 2>/dev/null || echo "Gazebo: NOT FOUND"

echo ""
echo "=== Python ==="
python3 --version

echo ""
echo "=== Python Packages ==="
python3 -c "import numpy; import cv2; import ikpy; print('Python packages: OK')" 2>/dev/null || echo "Python packages: MISSING"

echo ""
echo "=== NVIDIA GPU (optional) ==="
nvidia-smi --query-gpu=name,driver_version --format=csv,noheader 2>/dev/null || echo "No NVIDIA GPU (OK for Tier 1)"
```

Expected output for a fully configured Tier 2 system:
```
=== OS ===
Description:    Ubuntu 22.04.4 LTS

=== ROS 2 ===
ros2 --version
ROS 2: OK

=== Gazebo ===
Gazebo Sim, version 8.6.0

=== Python ===
Python 3.10.12

=== Python Packages ===
Python packages: OK

=== NVIDIA GPU (optional) ===
NVIDIA GeForce RTX 4070 Ti, 535.183.01
```

## Troubleshooting

### Problem 1: `ros2 command not found`

**Cause:** The ROS 2 setup script has not been sourced in the current terminal.

**Fix:**
```bash
source /opt/ros/humble/setup.bash
# Make it permanent:
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

### Problem 2: GPG key error when adding ROS 2 repository

**Cause:** The GPG key download failed, often due to a network proxy or firewall.

**Fix:**
```bash
# Remove and re-download the key
sudo rm -f /usr/share/keyrings/ros-archive-keyring.gpg
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
sudo apt update
```

If behind a proxy, configure `curl` to use it:
```bash
export https_proxy=http://your-proxy:port
```

### Problem 3: Gazebo fails to launch with `libGL` or display errors

**Cause:** Missing OpenGL libraries or no display server configured (common in WSL2 or SSH sessions).

**Fix:**
```bash
# Install OpenGL libraries
sudo apt install -y libgl1-mesa-glx libgl1-mesa-dri mesa-utils

# Test OpenGL
glxinfo | grep "OpenGL version"
```

For WSL2, ensure you have WSLg enabled (Windows 11) or install an X server like VcXsrv on Windows 10.

### Problem 4: `pip install` fails with permission error

**Cause:** Attempting to install packages to the system Python without a virtual environment.

**Fix:** Use a virtual environment as described in Section B.4, or use the `--user` flag:
```bash
pip install --user numpy opencv-python ikpy
```

### Problem 5: ROS 2 talker/listener demo shows no output in listener

**Cause:** ROS 2 DDS discovery may be blocked by a firewall or RMW configuration issue.

**Fix:**
```bash
# Ensure both terminals use the same ROS_DOMAIN_ID
export ROS_DOMAIN_ID=0

# Use the CycloneDDS middleware (more reliable for local testing)
sudo apt install -y ros-humble-rmw-cyclonedds-cpp
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
```

Add these to `~/.bashrc` to make them persistent.

## Next Steps

With your software stack installed, you are ready to begin [Chapter 1: Introduction to Physical AI](/docs/module-1/ch01-intro-physical-ai). If you need a cloud-based environment instead of a local setup, see [Appendix C: Cloud Lab Setup](./a3-cloud-lab-setup.md).
