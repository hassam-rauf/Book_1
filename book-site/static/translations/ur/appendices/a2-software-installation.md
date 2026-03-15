---
sidebar_position: 2
title: "ایپینڈکس بی: سافٹ ویئر انسٹالیشن گائیڈ"
description: "اوبنٹو 22.04، آر او ایس ٹو ہمبل، گیزیبو ہارمونک، اور پائتھون ڈیپینڈینسز کی مرحلہ وار انسٹالیشن۔"
---

# ایپینڈکس بی: سافٹ ویئر انسٹالیشن گائیڈ

<div dir="rtl">

## جائزہ

یہ ایپینڈکس (Appendix) سافٹ ویئر (Software) کے ہر اس حصے کے لیے مکمل، مرحلہ وار انسٹالیشن (Installation) کا عمل فراہم کرتا ہے جس کی آپ کو اس ٹیکسٹ بک (Textbook) کے ساتھ چلنے کے لیے ضرورت ہوگی۔ آپ اوبنٹو (Ubuntu) 22.04، آر او ایس ٹو (ROS 2) ہمبل (Humble)، گیزیبو (Gazebo) ہارمونک (Harmonic)، اور پورے کورس میں استعمال ہونے والی پائتھون (Python) سائنسی لائبریریوں کو انسٹال (Install) کریں گے۔

**کسے اس کی ضرورت ہے:** ہر پڑھنے والے کو۔ یہاں تک کہ اگر آپ کے پاس پہلے سے اوبنٹو (Ubuntu) انسٹال (Install) ہے، تب بھی آر او ایس ٹو (ROS 2) اور گیزیبو (Gazebo) کے سیکشنز کا جائزہ لیں تاکہ یہ یقینی بنایا جا سکے کہ آپ کا انوائرمنٹ (Environment) ٹیکسٹ بک (Textbook) کی توقعات کے مطابق ہے۔

**تخمینہ شدہ وقت:** انٹرنیٹ (Internet) کی رفتار کے لحاظ سے 1-2 گھنٹے۔

## پیشگی شرائط

- [ایپینڈکس اے: ہارڈویئر سیٹ اپ گائیڈ](./a1-hardware-setup.md) میں دی گئی **ٹیر 1 (Tier 1)** یا **ٹیر 2 (Tier 2)** ہارڈویئر (Hardware) کی ضروریات کو پورا کرنے والا کمپیوٹر (Computer)
- ایک مستحکم انٹرنیٹ کنکشن (Internet connection) (آپ تقریباً 2-3 جی بی پیکیجز (Packages) ڈاؤن لوڈ (Download) کریں گے)
- اگر آپ شروع سے اوبنٹو (Ubuntu) انسٹال (Install) کر رہے ہیں تو ایک یو ایس بی ڈرائیو (USB drive) (8 جی بی+)
- آپ کی مشین (Machine) پر ایڈمنسٹریٹر (Administrator) (sudo) تک رسائی

</div>

## B.1 اوبنٹو 22.04 ایل ٹی ایس انسٹال کرنا (Installing Ubuntu 22.04 LTS)

<div dir="rtl">

### آپشن اے: نیٹیو انسٹالیشن (Native Installation) (تجویز کردہ)

اگر آپ ایک وقف شدہ مشین (Machine) سیٹ اپ (Set up) کر رہے ہیں یا ڈوئل بوٹنگ (Dual-booting) کر رہے ہیں، تو اوبنٹو (Ubuntu) 22.04 ایل ٹی ایس (LTS) ڈاؤن لوڈ (Download) اور انسٹال (Install) کریں۔

1.  آئی ایس او (ISO) کو [https://releases.ubuntu.com/22.04/](https://releases.ubuntu.com/22.04/) سے ڈاؤن لوڈ (Download) کریں۔
2.  [بالینا ایچر (Balena Etcher)](https://etcher.balena.io/) یا `dd` کمانڈ (Command) کا استعمال کرتے ہوئے ایک بوٹ ایبل یو ایس بی ڈرائیو (Bootable USB drive) بنائیں۔
3.  یو ایس بی (USB) سے بوٹ (Boot) کریں اور گرافیکل انسٹالر (Graphical installer) کی پیروی کریں۔
4.  **"اوبنٹو (Ubuntu) انسٹال (Install) کریں"** کا انتخاب کریں اور **"ڈسک (Disk) مٹائیں اور انسٹال (Install) کریں"** (یا ڈوئل بوٹ (Dual-boot) کے لیے دستی پارٹیشننگ (Partitioning)) کو منتخب کریں۔
5.  اپنا یوزر نیم (Username)، ہوسٹ نیم (Hostname)، اور پاس ورڈ (Password) سیٹ (Set) کریں۔

انسٹالیشن (Installation) کے بعد، اپنے سسٹم (System) کو اپ ڈیٹ (Update) کریں:

</div>

```bash
sudo apt update && sudo apt upgrade -y
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output) (آخری چند لائنیں):

</div>

```
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
All packages are up to date.
```

<div dir="rtl">

### آپشن بی: ونڈوز (Windows) پر ڈبلیو ایس ایل ٹو (WSL2) (ماڈیول 1-2 کے لیے متبادل)

اگر آپ ونڈوز (Windows) 10/11 پر ہیں اور ڈوئل بوٹ (Dual-boot) نہیں کرنا چاہتے، تو ڈبلیو ایس ایل ٹو (WSL2) لینکس (Linux) کا ایک انوائرمنٹ (Environment) فراہم کرتا ہے جو آر او ایس ٹو (ROS 2) ڈیولپمنٹ (Development) کے لیے کافی ہے۔ نوٹ (Note) کریں کہ آئزک سم (Isaac Sim) کے لیے ڈبلیو ایس ایل ٹو (WSL2) پر جی پی یو پاس تھرو (GPU passthrough) تجرباتی ہے اور ماڈیول (Module) 3-4 کے لیے تجویز کردہ نہیں ہے۔

</div>

```bash
# Run this in PowerShell as Administrator
wsl --install -d Ubuntu-22.04
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
Installing: Ubuntu 22.04 LTS
Ubuntu 22.04 LTS has been installed.
```

<div dir="rtl">

انسٹالیشن (Installation) مکمل ہونے کے بعد، ایک نئی ٹرمینل ونڈو (Terminal window) کھل جائے گی جو آپ کو یونکس یوزر نیم (UNIX username) اور پاس ورڈ (Password) بنانے کا اشارہ دے گی۔ پھر پیکیجز (Packages) کو اپ ڈیٹ (Update) کریں:

</div>

```bash
sudo apt update && sudo apt upgrade -y
```

<div dir="rtl">

:::caution ڈبلیو ایس ایل ٹو (WSL2) کی حدود
ڈبلیو ایس ایل ٹو (WSL2) آر او ایس ٹو نوڈز (ROS 2 nodes)، ٹاپک (Topic) کمیونیکیشن (Communication)، اور بنیادی گیزیبو (Gazebo) (ہیڈ لیس موڈ (Headless mode)) کے لیے اچھی طرح کام کرتا ہے۔ تاہم، اس میں جی یو آئی ایپلیکیشنز (GUI applications) کے لیے محدود سپورٹ (Support) ہے اور آئزک سم (Isaac Sim) کے لیے کوئی قابل اعتماد جی پی یو پاس تھرو (GPU passthrough) نہیں ہے۔ ماڈیول (Module) 3-4 کے لیے، نیٹیو اوبنٹو (Native Ubuntu) انسٹالیشن (Installation) یا کلاؤڈ لیب (Cloud lab) استعمال کریں (دیکھیں [ایپینڈکس سی (Appendix C)](./a3-cloud-lab-setup.md))۔
:::

### ضروری بلڈ ٹولز (Build Tools) انسٹال کرنا

آپ نے جو بھی آپشن (Option) منتخب کیا ہو، یہ بنیادی ڈیولپمنٹ ٹولز (Development tools) انسٹال (Install) کریں:

</div>

```bash
sudo apt install -y build-essential cmake git curl wget \
  software-properties-common lsb-release gnupg2
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output) (آخری لائن):

</div>

```
Processing triggers for man-db (2.10.2-1) ...
```

<div dir="rtl">

## B.2 آر او ایس ٹو ہمبل (ROS 2 Humble) انسٹال کرنا

آر او ایس ٹو ہمبل ہاکسبل (ROS 2 Humble Hawksbill) اوبنٹو (Ubuntu) 22.04 کے لیے لانگ ٹرم سپورٹ (Long-Term Support) (ایل ٹی ایس (LTS)) ریلیز (Release) ہے۔ درج ذیل اقدامات [آفیشل آر او ایس ٹو ہمبل انسٹالیشن گائیڈ (official ROS 2 Humble installation guide)](https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html) کی پیروی کرتے ہیں۔

### مرحلہ 1: لوکیل (Locale) سیٹ کریں

</div>

```bash
locale  # check for UTF-8

sudo apt update && sudo apt install -y locales
sudo locale-gen en_US en_US.UTF-8
sudo update-locale LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8
export LANG=en_US.UTF-8

locale  # verify settings
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output) (شامل ہونا چاہیے):

</div>

```
LANG=en_US.UTF-8
```

<div dir="rtl">

### مرحلہ 2: مطلوبہ ریپوزیٹریز (Repositories) کو فعال کریں

</div>

```bash
sudo apt install -y software-properties-common
sudo add-apt-repository universe
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
'universe' distribution component enabled for all sources.
```

<div dir="rtl">

### مرحلہ 3: آر او ایس ٹو جی پی جی کی (ROS 2 GPG Key) شامل کریں

</div>

```bash
sudo apt update && sudo apt install -y curl
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
```

<div dir="rtl">

اگر کمانڈ (Command) کامیاب ہو جائے تو کوئی آؤٹ پٹ (Output) متوقع نہیں ہے۔

### مرحلہ 4: آر او ایس ٹو ریپوزیٹری (ROS 2 Repository) شامل کریں

</div>

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
```

<div dir="rtl">

### مرحلہ 5: آر او ایس ٹو ہمبل ڈیسک ٹاپ (ROS 2 Humble Desktop) انسٹال کریں

</div>

```bash
sudo apt update
sudo apt install -y ros-humble-desktop
```

<div dir="rtl">

یہ تقریباً 1.5 جی بی پیکیجز (Packages) ڈاؤن لوڈ (Download) کرتا ہے۔ متوقع آؤٹ پٹ (Output) (آخری چند لائنیں):

</div>

```
Setting up ros-humble-desktop ...
Processing triggers for libc-bin (2.35-0ubuntu3.8) ...
```

<div dir="rtl">

:::tip ڈیسک ٹاپ (Desktop) بمقابلہ بیس (Base)
`ros-humble-desktop` میٹا پیکج (Meta-package) میں آر ویز (RViz)، ڈیمو نوڈز (demo nodes)، اور جی یو آئی ٹولز (GUI tools) شامل ہیں۔ اگر آپ ہیڈ لیس سرور (headless server) یا ڈبلیو ایس ایل ٹو (WSL2) پر ہیں، تو آپ اس کی بجائے چھوٹا `ros-humble-ros-base` انسٹال (Install) کر سکتے ہیں، لیکن آپ ایکسرسائزز (exercises) میں استعمال ہونے والے ویژولائزیشن ٹولز (visualization tools) کو کھو دیں گے۔
:::

### مرحلہ 6: ڈیولپمنٹ ٹولز (Development Tools) انسٹال کریں

</div>

```bash
sudo apt install -y ros-dev-tools
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
Setting up ros-dev-tools ...
```

<div dir="rtl">

### مرحلہ 7: آر او ایس ٹو سیٹ اپ اسکرپٹ (ROS 2 Setup Script) کو سورس (Source) کریں

</div>

```bash
source /opt/ros/humble/setup.bash
```

<div dir="rtl">

ہر نئے ٹرمینل سیشن (Terminal session) کے لیے اسے خودکار بنانے کے لیے، اسے اپنی شیل کنفیگریشن (shell configuration) میں شامل کریں:

</div>

```bash
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

<div dir="rtl">

### مرحلہ 8: آر او ایس ٹو انسٹالیشن (ROS 2 Installation) کی تصدیق کریں

**دو** ٹرمینل ونڈوز (Terminal windows) کھولیں۔ پہلی ٹرمینل (Terminal) میں، چلائیں:

</div>

```bash
ros2 run demo_nodes_cpp talker
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
[INFO] [1234567890.123456789] [talker]: Publishing: 'Hello World: 1'
[INFO] [1234567890.234567890] [talker]: Publishing: 'Hello World: 2'
[INFO] [1234567890.345678901] [talker]: Publishing: 'Hello World: 3'
```

<div dir="rtl">

دوسری ٹرمینل (Terminal) میں، چلائیں:

</div>

```bash
ros2 run demo_nodes_py listener
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
[INFO] [1234567890.123456789] [listener]: I heard: [Hello World: 1]
[INFO] [1234567890.234567890] [listener]: I heard: [Hello World: 2]
```

<div dir="rtl">

اگر آپ کو ٹاکار (talker) اور لسنر (listener) کے درمیان پیغامات (Messages) کا بہاؤ نظر آتا ہے، تو آر او ایس ٹو (ROS 2) صحیح طریقے سے انسٹال (Install) ہے۔ روکنے کے لیے دونوں ٹرمینلز (Terminals) میں `Ctrl+C` دبائیں۔

</div>

## B.3 گیزیبو ہارمونک (Gazebo Harmonic) انسٹال کرنا

<div dir="rtl">

گیزیبو ہارمونک (Gazebo Harmonic) آر او ایس ٹو ہمبل (ROS 2 Humble) کے ساتھ استعمال کے لیے تجویز کردہ سیمولیشن انجن (simulation engine) ہے۔ درج ذیل اقدامات گیزیبو (Gazebo) اور آر او ایس ٹو انٹیگریشن برج (ROS 2 integration bridge) کو انسٹال (Install) کرتے ہیں۔

### مرحلہ 1: گیزیبو ہارمونک (Gazebo Harmonic) انسٹال کریں

</div>

```bash
sudo apt install -y wget
sudo wget https://packages.osrfoundation.org/gazebo.gpg -O /usr/share/keyrings/pkgs-osrf-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/pkgs-osrf-archive-keyring.gpg] http://packages.osrfoundation.org/gazebo/ubuntu-stable $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/gazebo-stable.list > /dev/null
sudo apt update
sudo apt install -y gz-harmonic
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output) (آخری لائن):

</div>

```
Setting up gz-harmonic ...
```

<div dir="rtl">

### مرحلہ 2: آر او ایس ٹو — گیزیبو برج (ROS 2 — Gazebo Bridge) انسٹال کریں

برج پیکیج (bridge package) آر او ایس ٹو ٹاپکس (ROS 2 topics) اور گیزیبو ٹرانسپورٹ (Gazebo transport) کو بغیر کسی رکاوٹ (seamlessly) کے بات چیت کرنے کی اجازت دیتا ہے۔

</div>

```bash
sudo apt install -y ros-humble-ros-gz
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
Setting up ros-humble-ros-gz ...
```

<div dir="rtl">

### مرحلہ 3: گیزیبو انسٹالیشن (Gazebo Installation) کی تصدیق کریں

</div>

```bash
gz sim --version
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
Gazebo Sim, version 8.x.x
```

<div dir="rtl">

ایک ٹیسٹ ورلڈ (Test world) شروع کریں:

</div>

```bash
gz sim shapes.sdf
```

<div dir="rtl">

ایک گیزیبو ونڈو (Gazebo window) کھلنی چاہیے جس میں بنیادی جیومیٹرک شیپس (geometric shapes) کے ساتھ ایک گراؤنڈ پلین (ground plane) دکھایا جائے۔ کام مکمل ہونے پر ونڈو (Window) بند کر دیں۔

:::tip ہیڈ لیس ٹیسٹنگ (Headless Testing)
اگر آپ ڈبلیو ایس ایل ٹو (WSL2) یا ہیڈ لیس سرور (headless server) پر ہیں، تو آپ ٹیسٹنگ (Testing) کے لیے گیزیبو (Gazebo) کو سرور (Server) صرف موڈ (mode) میں چلا سکتے ہیں:
```bash
gz sim -s shapes.sdf
```
یہ ایک جی یو آئی (GUI) ونڈو (Window) کو رینڈر (Render) کیے بغیر فزکس سیمولیشن (physics simulation) چلاتا ہے۔
:::

</div>

## B.4 پائتھون ڈیپینڈینسز (Python Dependencies) انسٹال کرنا

<div dir="rtl">

ٹیکسٹ بک (Textbook) روبوٹکس الگورتھم (robotics algorithms)، کمپیوٹر ویژن (computer vision)، اور کائنیمیٹکس (kinematics) کے لیے کئی پائتھون (Python) پیکیجز (Packages) استعمال کرتا ہے۔

### مرحلہ 1: پپ (pip) انسٹال کریں

</div>

```bash
sudo apt install -y python3-pip python3-venv
```

<div dir="rtl">

### مرحلہ 2: ایک ورچوئل انوائرمنٹ (Virtual Environment) بنائیں (تجویز کردہ)

</div>

```bash
python3 -m venv ~/ros2_venv
source ~/ros2_venv/bin/activate
```

<div dir="rtl">

:::caution ورچوئل انوائرمنٹ (Virtual Environment) اور آر او ایس ٹو (ROS 2)
ورچوئل انوائرمنٹ (Virtual environment) استعمال کرتے وقت، آپ کو آر او ایس ٹو سیٹ اپ (ROS 2 setup) اور وی این وی ایکٹیویشن (venv activation) دونوں کو سورس (source) کرنا ہوگا۔ اگر چاہیں تو دونوں کو اپنی `.bashrc` میں شامل کریں:
```bash
echo "source ~/ros2_venv/bin/activate" >> ~/.bashrc
```
نوٹ (Note) کریں کہ `apt` کے ذریعے انسٹال (Install) کیے گئے کچھ آر او ایس ٹو پائتھون پیکیجز (ROS 2 Python packages) (جیسے `rclpy`) سسٹم پائتھون پاتھ (system Python path) میں رہتے ہیں۔ اگر آپ کو وی این وی (venv) کے اندر `rclpy` کے لیے امپورٹ ایررز (import errors) کا سامنا کرنا پڑتا ہے، تو `--system-site-packages` استعمال کریں:
```bash
python3 -m venv ~/ros2_venv --system-site-packages
```
:::

### مرحلہ 3: مطلوبہ پائتھون پیکیجز (Python Packages) انسٹال کریں

</div>

```bash
pip install numpy opencv-python ikpy matplotlib scipy transforms3d
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output) (آخری لائنیں):

</div>

```
Successfully installed numpy-1.26.4 opencv-python-4.10.0.84 ikpy-3.3.4 ...
```

<div dir="rtl">

**پیکیج (Package) کے مقاصد:**

| پیکیج (Package)      | استعمال شدہ | مقصد |
|-----------------|----------|------|
| `numpy`         | تمام ماڈیولز (Modules)  | ارے میتھ (Array math)، لینیئر الجبرا (linear algebra) |
| `opencv-python` | ماڈیول 3-4     | کمپیوٹر ویژن (Computer vision)، امیج پروسیسنگ (image processing) |
| `ikpy`          | ماڈیول 4     | روبوٹ آرمز (Robot arms) کے لیے انورس کائنیمیٹکس (Inverse kinematics) |
| `matplotlib`    | تمام ماڈیولز (Modules)  | پلاٹنگ (Plotting) اور ویژولائزیشن (visualization) |
| `scipy`         | ماڈیول 4     | آپٹیمائزیشن (Optimization)، سپیشل ٹرانسفارمز (spatial transforms) |
| `transforms3d`  | ماڈیول 2-4     | تھری ڈی روٹیشن (3D rotation) اور ٹرانسفارمیشن یوٹیلیٹیز (transformation utilities) |

### مرحلہ 4: پائتھون پیکیجز (Python Packages) کی تصدیق کریں

</div>

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

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
NumPy:   1.26.4
OpenCV:  4.10.0
IKPy:    3.3.4
All packages imported successfully.
```

<div dir="rtl">

## B.5 این ویڈیا ڈرائیورز (NVIDIA Drivers) اور کیوڈا (CUDA) انسٹال کرنا (صرف ٹیر 2 کے لیے)

اگر آپ کے پاس ایک این ویڈیا جی پی یو (NVIDIA GPU) ہے اور آپ آئزک سم (Isaac Sim) (ماڈیول (Module) 3-4) چلانے کا ارادہ رکھتے ہیں، تو این ویڈیا ڈرائیور (NVIDIA driver) اور کیوڈا ٹول کٹ (CUDA toolkit) انسٹال (Install) کریں۔

</div>

```bash
# Install the recommended NVIDIA driver
sudo apt install -y nvidia-driver-535

# Reboot to load the driver
sudo reboot
```

<div dir="rtl">

ری بوٹ (Reboot) کے بعد:

</div>

```bash
# Verify driver installation
nvidia-smi
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output): آپ کے جی پی یو نیم (GPU name)، ڈرائیور ورژن (driver version)، اور کیوڈا ورژن (CUDA version) کو دکھانے والی ایک ٹیبل (Table)۔

</div>

```bash
# Install CUDA toolkit (required for Isaac Sim and TensorRT)
sudo apt install -y nvidia-cuda-toolkit
nvcc --version
```

<div dir="rtl">

متوقع آؤٹ پٹ (Output):

</div>

```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2023 NVIDIA Corporation
Built on ...
Cuda compilation tools, release 12.2, V12.2.xxx
```

<div dir="rtl">

## تصدیق (Verification)

اپنے پورے سافٹ ویئر اسٹیک (software stack) کی تیاری کی تصدیق کے لیے اس جامع تصدیقی اسکرپٹ (comprehensive verification script) کو چلائیں۔

</div>

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

<div dir="rtl">

مکمل طور پر کنفیگر (Configure) شدہ ٹیر 2 (Tier 2) سسٹم (System) کے لیے متوقع آؤٹ پٹ (Output):

</div>

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

<div dir="rtl">

## مسائل کا حل (Troubleshooting)

### مسئلہ (Problem) 1: `ros2 command not found`

**وجہ (Cause):** آر او ایس ٹو سیٹ اپ اسکرپٹ (ROS 2 setup script) موجودہ ٹرمینل (Terminal) میں سورس (source) نہیں کیا گیا ہے۔

**حل (Fix):**

</div>

```bash
source /opt/ros/humble/setup.bash
# Make it permanent:
echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
```

<div dir="rtl">

### مسئلہ (Problem) 2: آر او ایس ٹو ریپوزیٹری (ROS 2 repository) شامل کرتے وقت جی پی جی کی (GPG key) کی خرابی

**وجہ (Cause):** جی پی جی کی (GPG key) ڈاؤن لوڈ (download) ناکام ہو گئی، اکثر نیٹ ورک پراکسی (network proxy) یا فائر وال (firewall) کی وجہ سے۔

**حل (Fix):**

</div>

```bash
# Remove and re-download the key
sudo rm -f /usr/share/keyrings/ros-archive-keyring.gpg
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
sudo apt update
```

<div dir="rtl">

اگر پراکسی (proxy) کے پیچھے ہیں تو، اسے استعمال کرنے کے لیے `curl` کو کنفیگر (configure) کریں:

</div>

```bash
export https_proxy=http://your-proxy:port
```

<div dir="rtl">

### مسئلہ (Problem) 3: گیزیبو (Gazebo) `libGL` یا ڈسپلے ایررز (display errors) کے ساتھ لانچ (Launch) ہونے میں ناکام رہتا ہے

**وجہ (Cause):** اوپن جی ایل لائبریریز (OpenGL libraries) غائب ہیں یا کوئی ڈسپلے سرور (display server) کنفیگر (configure) نہیں ہے (ڈبلیو ایس ایل ٹو (WSL2) یا ایس ایس ایچ سیشنز (SSH sessions) میں عام)۔

**حل (Fix):**

</div>

```bash
# Install OpenGL libraries
sudo apt install -y libgl1-mesa-glx libgl1-mesa-dri mesa-utils

# Test OpenGL
glxinfo | grep "OpenGL version"
```

<div dir="rtl">

ڈبلیو ایس ایل ٹو (WSL2) کے لیے، یقینی بنائیں کہ آپ نے ڈبلیو ایس ایل جی (WSLg) فعال کر رکھا ہے (ونڈوز (Windows) 11) یا ونڈوز (Windows) 10 پر وی سی ایکس ایس آر وی (VcXsrv) جیسا ایک ایکس سرور (X server) انسٹال (Install) کریں۔

### مسئلہ (Problem) 4: `pip install` اجازت کی خرابی (permission error) کے ساتھ ناکام رہتا ہے

**وجہ (Cause):** ورچوئل انوائرمنٹ (virtual environment) کے بغیر سسٹم پائتھون (system Python) میں پیکیجز (Packages) انسٹال (Install) کرنے کی کوشش۔

**حل (Fix):** سیکشن (Section) B.4 میں بیان کردہ ورچوئل انوائرمنٹ (virtual environment) استعمال کریں، یا `--user` فلیگ (flag) استعمال کریں:

</div>

```bash
pip install --user numpy opencv-python ikpy
```

<div dir="rtl">

### مسئلہ (Problem) 5: آر او ایس ٹو ٹاکار/لسنر (ROS 2 talker/listener) ڈیمو (demo) لسنر (listener) میں کوئی آؤٹ پٹ (output) نہیں دکھاتا

**وجہ (Cause):** آر او ایس ٹو ڈی ڈی ایس ڈسکوری (ROS 2 DDS discovery) فائر وال (firewall) یا آر ایم ڈبلیو کنفیگریشن مسئلہ (RMW configuration issue) سے بلاک (block) ہو سکتی ہے۔

**حل (Fix):**

</div>

```bash
# Ensure both terminals use the same ROS_DOMAIN_ID
export ROS_DOMAIN_ID=0

# Use the CycloneDDS middleware (more reliable for local testing)
sudo apt install -y ros-humble-rmw-cyclonedds-cpp
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
```

<div dir="rtl">

انہیں `~/.bashrc` میں شامل کریں تاکہ وہ مستقل رہیں۔

## اگلے اقدامات (Next Steps)

اپنے سافٹ ویئر اسٹیک (software stack) کے انسٹال (Install) ہونے کے ساتھ، آپ اب [چیپٹر 1: فزیکل اے آئی کا تعارف](/docs/module-1/ch01-intro-physical-ai) شروع کرنے کے لیے تیار ہیں۔ اگر آپ کو مقامی سیٹ اپ (local setup) کے بجائے کلاؤڈ بیسڈ انوائرمنٹ (cloud-based environment) کی ضرورت ہے، تو [ایپینڈکس سی: کلاؤڈ لیب سیٹ اپ (Appendix C: Cloud Lab Setup)](./a3-cloud-lab-setup.md) دیکھیں۔

</div>