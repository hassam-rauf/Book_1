---
sidebar_position: 3
title: "ضمیمہ ج: کلاؤڈ لیب سیٹ اپ"
description: "آئزک سم، آر او ایس ٹو، اور جی پی یو ایکسیلیریٹڈ روبوٹکس کے لیے کلاؤڈ بیسڈ ڈیولپمنٹ ماحول کا قیام۔"
---

# ضمیمہ ج: کلاؤڈ لیب سیٹ اپ (Appendix C: Cloud Lab Setup)

## جائزہ (Overview)

<div dir="rtl">

ہر طالب علم کو این ویڈیا (NVIDIA) آر ٹی ایکس (RTX) ورک سٹیشن (workstation) تک رسائی حاصل نہیں ہوتی۔ یہ ضمیمہ (appendix) آپ کو دکھاتا ہے کہ کلاؤڈ جی پی یو (GPU) انسٹینسز (instances) کا استعمال کرتے ہوئے آئزک سم (Isaac Sim) چلانے، اے آئی (AI) ماڈلز (models) کی ٹریننگ (training) کرنے، اور آر او ایس ٹو (ROS 2) ایپلیکیشنز (applications) کو ڈیولپ (develop) کرنے کے لیے مکمل طور پر فعال کلاؤڈ بیسڈ لیب (cloud-based lab) کیسے سیٹ اپ کی جائے۔

</div>

<div dir="rtl">

آپ تین طریقوں سے سیکھیں گے: آئزک سم (Isaac Sim) کے لیے این ویڈیا اومنیورس کلاؤڈ (NVIDIA Omniverse Cloud)، عام ڈیولپمنٹ (development) کے لیے ایک جی پی یو کلاؤڈ وی ایم (GPU cloud VM)، اور نوٹ بک بیسڈ تجربات (notebook-based experiments) کے لیے گوگل کولاب (Google Colab)۔

</div>

<div dir="rtl">

**کسے اس کی ضرورت ہے:** ٹیر ٹو (Tier 2) جی پی یو (GPU) ورک سٹیشن (workstation) کے بغیر طلباء (دیکھیں [ضمیمہ اے](./a1-hardware-setup.md))، یا کوئی بھی جو پورٹیبل (portable)، دوبارہ پیدا کیا جا سکنے والا ماحول (reproducible environment) چاہتا ہے۔

</div>

<div dir="rtl">

**تخمینہ شدہ وقت:** ابتدائی سیٹ اپ کے لیے 1--2 گھنٹے لگیں گے۔

</div>

## پیشگی شرائط (Prerequisites)

<div dir="rtl">

*   ایک ویب براؤزر (web browser) (کروم (Chrome) یا فائر فاکس (Firefox) کی سفارش کی جاتی ہے)
*   ایک این ویڈیا (NVIDIA) اکاؤنٹ (بنانا مفت ہے)
*   کلاؤڈ وی ایم (cloud VM) فراہم کنندگان کے لیے ایک کریڈٹ کارڈ (credit card) (مفت ٹائر (free tiers) اور کریڈٹس (credits) دستیاب ہیں)
*   مقامی طور پر ایس ایس ایچ (SSH) کلائنٹ (client) انسٹال (`ssh` لینکس/میک او ایس پر، یا اوپن ایس ایس ایچ (OpenSSH) کے ساتھ ونڈوز ٹرمینل (Windows Terminal))

</div>

## سی 1: آئزک سم کے لیے این ویڈیا اومنیورس کلاؤڈ (NVIDIA Omniverse Cloud for Isaac Sim)

<div dir="rtl">

این ویڈیا (NVIDIA) اومنیورس کلاؤڈ (Omniverse Cloud) کے ذریعے آئزک سم (Isaac Sim) کو کلاؤڈ سٹریمڈ ایپلیکیشن (cloud-streamed application) کے طور پر پیش کرتا ہے۔ یہ مقامی جی پی یو (GPU) ہارڈ ویئر (hardware) کے بغیر آئزک سم (Isaac Sim) چلانے کا سب سے سیدھا طریقہ ہے۔

</div>

### مرحلہ 1: ایک این ویڈیا اکاؤنٹ بنائیں (Create an NVIDIA Account)

<div dir="rtl">

1.  [https://developer.nvidia.com/](https://developer.nvidia.com/) پر جائیں
2.  **"شامل ہوں (Join)"** یا **"لاگ ان کریں (Log In)"** پر کلک کریں اور ایک مفت ڈیولپر (developer) اکاؤنٹ بنائیں
3.  اپنے ای میل ایڈریس (email address) کی تصدیق کریں

</div>

### مرحلہ 2: اومنیورس کلاؤڈ تک رسائی حاصل کریں (Access Omniverse Cloud)

<div dir="rtl">

1.  [https://www.nvidia.com/en-us/omniverse/](https://www.nvidia.com/en-us/omniverse/) پر جائیں
2.  **"ابھی آزمائیں (Try Now)"** یا **"مفت شروع کریں (Get Started Free)"** پر کلک کریں
3.  اپنے این ویڈیا (NVIDIA) ڈیولپر (developer) اکاؤنٹ کے ساتھ سائن ان کریں

</div>

:::tip مفت ٹیر کی دستیابی (Free Tier Availability)
<div dir="rtl">

این ویڈیا (NVIDIA) وقفے وقفے سے اومنیورس کلاؤڈ (Omniverse Cloud) تک مفت آزمائشی رسائی (free trial access) فراہم کرتا ہے۔ موجودہ دستیابی کے لیے اومنیورس کلاؤڈ (Omniverse Cloud) صفحہ چیک کریں۔ اگر کوئی مفت ٹیر (free tier) دستیاب نہیں ہے، تو متبادل (alternative) جی پی یو کلاؤڈ (GPU cloud) آپشنز (options) کے لیے سیکشن سی 2 دیکھیں۔

</div>
:::

### مرحلہ 3: براؤزر میں آئزک سم لانچ کریں (Launch Isaac Sim in the Browser)

<div dir="rtl">

1.  اومنیورس کلاؤڈ (Omniverse Cloud) ڈیش بورڈ (dashboard) سے، ایپلیکیشن (application) فہرست سے **"آئزک سم (Isaac Sim)"** کو منتخب کریں
2.  ایک جی پی یو (GPU) انسٹینس (instance) کا سائز منتخب کریں (سیکھنے کے لیے سب سے چھوٹا دستیاب کافی ہے)
3.  **"لانچ (Launch)"** پر کلک کریں -- ایپلیکیشن (application) 2-5 منٹ کے اندر آپ کے براؤزر (browser) پر سٹریم (stream) ہونا شروع ہو جائے گی

</div>

<div dir="rtl">

ایک بار لوڈ ہونے کے بعد، آپ اپنے براؤزر (browser) میں Isaac Sim ویو پورٹ (viewport) دیکھیں گے۔ آپ یہ کر سکتے ہیں:

</div>

<div dir="rtl">

*   روبوٹ (Robot) ماڈلز (URDF/USD) لوڈ کریں
*   سمولیشن (Simulation) ماحول بنائیں
*   ROS 2 برج (bridge) کنکشنز (connections) چلائیں

</div>

### مرحلہ 4: اپنے مقامی آر او ایس ٹو کو کلاؤڈ آئزک سم سے منسلک کریں (Connect Your Local ROS 2 to Cloud Isaac Sim)

<div dir="rtl">

کلاؤڈ میں آئزک سم (Isaac Sim) آپ کی مقامی ROS 2 انسٹالیشن (installation) کے ساتھ ایک نیٹ ورک (network) پر ROS 2 برج (bridge) کا استعمال کرتے ہوئے بات چیت کر سکتا ہے۔ آپ کو ایک محفوظ ٹنل (secure tunnel) سیٹ اپ کرنے کی ضرورت ہے۔

</div>

<div dir="rtl">

اپنی مقامی مشین (local machine) پر، DDS ڈسکوری (discovery) کو ٹنل (tunnel) پر کام کرنے کے لیے کنفیگر (configure) کریں:

</div>

```bash
# Install the ROS 2 Humble bridge package (on your local Ubuntu)
sudo apt install -y ros-humble-ros-gz-bridge

# Set the ROS_DOMAIN_ID to match the cloud instance
export ROS_DOMAIN_ID=42
```

:::caution انٹرنیٹ پر ڈی ڈی ایس (DDS Over the Internet)
<div dir="rtl">

بطور ڈیفالٹ، ROS 2 نوڈ ڈسکوری (node discovery) کے لیے ملٹی کاسٹ یو ڈی پی (multicast UDP) استعمال کرتا ہے، جو انٹرنیٹ (internet) پر کام نہیں کرتا۔ کلاؤڈ سے مقامی کمیونیکیشن (cloud-to-local communication) کے لیے، آپ کو درج ذیل میں سے ایک کو کنفیگر (configure) کرنا ہوگا:

</div>

<div dir="rtl">

1.  **زینوہ برج (Zenoh bridge)** (تجویز کردہ): ایک ROS 2 مڈل ویئر (middleware) جو ٹی سی پی (TCP) پر کام کرتا ہے
2.  **سائیکلون ڈی ڈی ایس (CycloneDDS) ایکس ایم ایل (XML) کنفیگ (config) کے ساتھ**: دستی یونیکاسٹ (unicast) پیئر (peer) کنفیگریشن (configuration)
3.  **پورٹ فارورڈنگ (port forwarding) کے ساتھ ایس ایس ایچ ٹنل (SSH tunnel)**: ایس ایس ایچ (SSH) کے ذریعے ڈی ڈی ایس پورٹس (ports) کو فارورڈ (forward) کریں

</div>

<div dir="rtl">

Zenoh کا طریقہ سب سے آسان ہے۔ اسے اس کے ساتھ انسٹال کریں:

</div>

```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp
```
:::

## سی 2: جی پی یو کلاؤڈ وی ایم سیٹ اپ (GPU Cloud VM Setup)

<div dir="rtl">

اپنے ڈیولپمنٹ ماحول (development environment) پر مکمل کنٹرول کے لیے، آپ ایک جی پی یو کلاؤڈ وی ایم (GPU cloud VM) فراہم (provision) کر سکتے ہیں۔ یہ سیکشن لیمبڈا لیبز (Lambda Labs) (جی پی یو فوکسڈ، سادہ قیمتوں کا تعین) پر سیٹ اپ اور عمومی اقدامات کا احاطہ کرتا ہے جو اے ڈبلیو ایس (AWS)، جی سی پی (GCP)، یا ایژور (Azure) پر لاگو ہوتے ہیں۔

</div>

### آپشن اے: لیمبڈا لیبز جی پی یو کلاؤڈ (Lambda Labs GPU Cloud)

<div dir="rtl">

لیمبڈا لیبز (Lambda Labs) اوبنٹو (Ubuntu) اور این ویڈیا ڈرائیورز (NVIDIA drivers) پری انسٹالڈ (pre-installed) کے ساتھ آن ڈیمانڈ جی پی یو انسٹینسز (on-demand GPU instances) فراہم کرتا ہے۔

</div>

#### مرحلہ 1: ایک اکاؤنٹ بنائیں (Create an Account)

<div dir="rtl">

1.  [https://lambdalabs.com/service/gpu-cloud](https://lambdalabs.com/service/gpu-cloud) پر جائیں
2.  ایک اکاؤنٹ بنائیں اور ادائیگی کا طریقہ (payment method) شامل کریں
3.  موجودہ قیمت ایک A10G انسٹینس (24 جی بی وی ریم (VRAM)) کے لیے تقریباً $1.10/گھنٹہ ہے

</div>

#### مرحلہ 2: ایس ایس ایچ کیز بنائیں (Generate SSH Keys)

```bash
# On your local machine, generate an SSH key if you don't have one
ssh-keygen -t ed25519 -C "robotics-lab" -f ~/.ssh/lambda_key
cat ~/.ssh/lambda_key.pub
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... robotics-lab
```

<div dir="rtl">

پبلک کی (public key) کو کاپی کریں اور اسے اپنے لیمبڈا لیبز اکاؤنٹ (Lambda Labs account) میں ڈیش بورڈ (dashboard) میں **SSH Keys** کے تحت شامل کریں۔

</div>

#### مرحلہ 3: ایک انسٹینس لانچ کریں (Launch an Instance)

<div dir="rtl">

1.  **"1x A10 (24 جی بی)"** منتخب کریں -- یہ آئزک سم (Isaac Sim) اور ماڈل ٹریننگ (model training) کے لیے کافی ہے
2.  او ایس (OS) کے طور پر **اوبنٹو 22.04** منتخب کریں
3.  اپنی ایس ایس ایچ کی (SSH key) منتخب کریں
4.  **"انسٹینس لانچ کریں (Launch instance)"** پر کلک کریں

</div>

#### مرحلہ 4: ایس ایس ایچ کے ذریعے منسلک ہوں (Connect via SSH)

```bash
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE_IP>
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-xxx-generic x86_64)
...
ubuntu@lambda-instance:~$
```

#### مرحلہ 5: کلاؤڈ وی ایم پر آر او ایس ٹو انسٹال کریں (Install ROS 2 on the Cloud VM)

<div dir="rtl">

ایک بار منسلک ہونے کے بعد، [ضمیمہ بی](./a2-software-installation.md)، سیکشن بی 2 سے بی 4 تک کے وہی ROS 2 Humble انسٹالیشن (installation) کے مراحل پر عمل کریں۔ لیمبڈا انسٹینسز (Lambda instances) این ویڈیا ڈرائیورز (NVIDIA drivers) اور کیوڈ اے (CUDA) پری انسٹالڈ (pre-installed) کے ساتھ آتے ہیں، لہذا آپ سیکشن بی 5 کو چھوڑ سکتے ہیں۔

</div>

<div dir="rtl">

تصدیق کریں کہ جی پی یو (GPU) دستیاب ہے:

</div>

```bash
nvidia-smi
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
+-----------------------------------------------------------------------------+
| NVIDIA A10G 24GB                                                            |
+-----------------------------------------------------------------------------+
```

### آپشن بی: گوگل کلاؤڈ پلیٹ فارم (جی سی پی) (Google Cloud Platform (GCP))

<div dir="rtl">

جی سی پی (GCP) نئے اکاؤنٹس کے لیے $300 کے مفت کریڈٹس (free credits) پیش کرتا ہے، جو تقریباً 60--100 گھنٹے کے جی پی یو ٹائم (GPU time) کے لیے کافی ہیں۔

</div>

<div dir="rtl">

1.  [https://cloud.google.com/free](https://cloud.google.com/free) پر جائیں اور اپنی مفت آزمائش (free trial) فعال کریں
2.  کمپیوٹ انجن (Compute Engine) میں ایک وی ایم انسٹینس (VM instance) بنائیں:
    *   مشین ٹائپ (Machine type): 1x این ویڈیا (NVIDIA) T4 جی پی یو (GPU) کے ساتھ `n1-standard-8`
    *   بوٹ ڈسک (Boot disk): اوبنٹو (Ubuntu) 22.04 ایل ٹی ایس (LTS)، 200 جی بی ایس ایس ڈی (SSD)
    *   ایچ ٹی ٹی پی (HTTP)/ایچ ٹی ٹی پی ایس (HTTPS) ٹریفک (traffic) کی اجازت دیں
3.  جی سی پی (GCP) کنسول (console) سے یا `gcloud compute ssh` کے ذریعے انسٹینس (instance) میں ایس ایس ایچ (SSH) کریں

</div>

### لاگت کا تخمینہ (Cost Estimation)

| فراہم کنندہ | جی پی یو | وی ریم | تقریباً لاگت/گھنٹہ | 120 گھنٹے (1 سہ ماہی) |
|----------|-----|------|-------------------|-----------------------|
| Lambda Labs | A10G | 24 GB | $1.10 | $132 |
| AWS (g5.2xlarge) | A10G | 24 GB | $1.50 | $180 |
| GCP (T4) | T4 | 16 GB | $0.95 | $114 |
| GCP (free credits) | T4 | 16 GB | $0 (first $300) | $0 |

:::tip لاگت بچانے کی حکمت عملی (Cost-Saving Strategy)
<div dir="rtl">

1.  **استعمال میں نہ ہونے پر انسٹینسز (instances) کو روک دیں۔** کلاؤڈ وی ایمز (Cloud VMs) چلتے وقت فی سیکنڈ بل (bill) کرتے ہیں۔
2.  ٹریننگ ورک لوڈز (training workloads) کے لیے **اسپاٹ (spot)/پرییمپٹ ایبل (preemptible) انسٹینسز (instances) استعمال کریں** (50-70% سستے)۔
3.  **کلاؤڈ میں ٹریننگ (training) کریں، جیٹسن (Jetson) پر انفر (infer) کریں۔** ماڈل ویٹس (model weights) کو اپنے مقامی جیٹسن کٹ (Jetson kit) میں ڈیپلائمنٹ (deployment) کے لیے ڈاؤن لوڈ (download) کریں۔

</div>
:::

## سی 3: نوٹ بک تجربات کے لیے گوگل کولاب (Google Colab for Notebook Experiments)

<div dir="rtl">

ہلکے تجربات (lightweight experiments)، ڈیٹا ایکسپلوریشن (data exploration)، اور ماڈل پروٹوٹائپنگ (model prototyping) کے لیے، گوگل کولاب (Google Colab) براہ راست آپ کے براؤزر (browser) میں مفت جی پی یو (GPU) رسائی (access) فراہم کرتا ہے۔

</div>

### مرحلہ 1: گوگل کولاب کھولیں (Open Google Colab)

<div dir="rtl">

1.  [https://colab.research.google.com/](https://colab.research.google.com/) پر جائیں
2.  اپنے گوگل (Google) اکاؤنٹ کے ساتھ سائن ان کریں

</div>

### مرحلہ 2: جی پی یو رن ٹائم فعال کریں (Enable GPU Runtime)

<div dir="rtl">

1.  **رن ٹائم (Runtime)** > **رن ٹائم ٹائپ تبدیل کریں (Change runtime type)** پر کلک کریں
2.  ہارڈ ویئر ایکسیلیریٹر (Hardware accelerator) ڈراپ ڈاؤن (dropdown) سے **"T4 جی پی یو (GPU)"** منتخب کریں
3.  **"محفوظ کریں (Save)"** پر کلک کریں

</div>

### مرحلہ 3: جی پی یو تک رسائی کی تصدیق کریں (Verify GPU Access)

<div dir="rtl">

کولاب (Colab) نوٹ بک (notebook) میں یہ سیل (cell) چلائیں:

</div>

```python
!nvidia-smi
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.104.05   Driver Version: 535.104.05   CUDA Version: 12.2     |
|   0  Tesla T4            16384MiB                                            |
+-----------------------------------------------------------------------------+
```

### مرحلہ 4: کولاب میں آر او ایس ٹو انسٹال کریں (محدود) (Install ROS 2 in Colab (Limited))

<div dir="rtl">

اگرچہ کولاب (Colab) ROS 2 کے لیے ڈیزائن نہیں کیا گیا ہے، آپ اسے بنیادی تجربات (basic experiments) کے لیے انسٹال کر سکتے ہیں:

</div>

```python
%%bash
sudo apt update -qq
sudo apt install -y -qq software-properties-common curl gnupg2
sudo curl -sSL https://raw.githubusercontent.com/ros/rosdistro/master/ros.key -o /usr/share/keyrings/ros-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/ros-archive-keyring.gpg] http://packages.ros.org/ros2/ubuntu $(. /etc/os-release && echo $UBUNTU_CODENAME) main" | sudo tee /etc/apt/sources.list.d/ros2.list > /dev/null
sudo apt update -qq
sudo apt install -y -qq ros-humble-ros-base python3-colcon-common-extensions
```

:::warning کولاب کی حدود (Colab Limitations)
<div dir="rtl">

گوگل کولاب (Google Colab) پروٹوٹائپنگ (prototyping) کے لیے مفید ہے لیکن اس کی اہم حدود (significant limitations) ہیں:

</div>

<div dir="rtl">

*   90 منٹ کی غیر فعالیت (inactivity) کے بعد سیشنز (Sessions) ٹائم آؤٹ (timeout) ہو جاتے ہیں (زیادہ سے زیادہ 12 گھنٹے)
*   کوئی مستقل فائل سسٹم (persistent filesystem) نہیں (سیشن (session) ختم ہونے پر فائلیں ضائع ہو جاتی ہیں)
*   `ros-humble-ros-base` تک محدود (آر ویز (RViz) جیسے کوئی جی یو آئی (GUI) ٹولز (tools) نہیں)
*   کوئی گیزبو (Gazebo) یا آئزک سم (Isaac Sim) سپورٹ (support) نہیں

</div>

<div dir="rtl">

پائتھن بیسڈ مشقیں (Python-based exercises) (کائنمیٹکس (kinematics)، کمپیوٹر ویژن (computer vision)، ماڈل انفرنس (model inference)) کے لیے کولاب (Colab) استعمال کریں اور سمولیشن (simulation) کے کام کے لیے ایک مکمل کلاؤڈ وی ایم (full cloud VM) استعمال کریں۔

</div>
:::

## سی 4: ریموٹ آر او ایس ٹو کے لیے ایس ایس ایچ ٹنلز کی کنفیگریشن (Configuring SSH Tunnels for Remote ROS 2)

<div dir="rtl">

کلاؤڈ وی ایم (cloud VM) پر ROS 2 چلاتے وقت، آپ شاید آر ویز (RViz) یا دیگر جی یو آئی ٹولز (GUI tools) کا استعمال کرتے ہوئے ٹاپکس (topics) کو مقامی طور پر ویزوئیلائز (visualize) کرنا چاہیں گے۔ ایس ایس ایچ ٹنلنگ (SSH tunneling) اس کو ممکن بناتی ہے۔

</div>

### ایس ایس ایچ کے ذریعے آر او ایس ٹو ڈی ڈی ایس ٹریفک فارورڈ کریں (Forward ROS 2 DDS Traffic Over SSH)

```bash
# On your local machine, create an SSH tunnel forwarding DDS ports
# Port 7400-7500 are typically used by DDS discovery and data
ssh -i ~/.ssh/lambda_key -L 7400:localhost:7400 -L 7401:localhost:7401 \
  ubuntu@<INSTANCE_IP>
```

### قابل اعتماد کلاؤڈ-مقامی کمیونیکیشن کے لیے زینوہ استعمال کریں (Use Zenoh for Reliable Cloud-Local Communication)

<div dir="rtl">

زینوہ (Zenoh) کلاؤڈ (cloud) اور مقامی مشینوں (local machines) کے درمیان ROS 2 کمیونیکیشن (communication) کے لیے سب سے قابل اعتماد طریقہ (reliable method) ہے۔

</div>

<div dir="rtl">

**کلاؤڈ وی ایم (cloud VM)** پر:

</div>

```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp

# Start a Zenoh router
ros2 run rmw_zenoh_cpp zenoh_router
```

<div dir="rtl">

اپنی **مقامی مشین (local machine)** پر:

</div>

```bash
sudo apt install -y ros-humble-rmw-zenoh-cpp
export RMW_IMPLEMENTATION=rmw_zenoh_cpp

# Configure the Zenoh router address (replace with your cloud VM IP)
export ZENOH_ROUTER=tcp/<INSTANCE_IP>:7447
```

<div dir="rtl">

اب کلاؤڈ وی ایم (cloud VM) پر شائع کیے گئے ROS 2 ٹاپکس (topics) آپ کی مقامی مشین (local machine) پر نظر آئیں گے، اور اس کے برعکس (vice versa)۔

</div>

## سی 5: ویب براؤزر کے ذریعے آئزک سم تک رسائی (Accessing Isaac Sim via Web Browser)

<div dir="rtl">

اگر آپ آئزک سم (Isaac Sim) کو کلاؤڈ وی ایم (cloud VM) پر انسٹال کرتے ہیں (بجائے اومنیورس کلاؤڈ (Omniverse Cloud) استعمال کرنے کے)، تو آپ این ویڈیا (NVIDIA) کی بلٹ ان سٹریمنگ (built-in streaming) کا استعمال کرتے ہوئے ویو پورٹ (viewport) کو اپنے براؤزر (browser) پر سٹریم (stream) کر سکتے ہیں۔

</div>

### کلاؤڈ وی ایم پر آئزک سم انسٹال کریں (Install Isaac Sim on the Cloud VM)

```bash
# On the cloud VM (requires A10G or better GPU)
# Download the Isaac Sim AppImage from NVIDIA
# Follow the instructions at: https://docs.omniverse.nvidia.com/isaacsim/latest/installation/install_workstation.html

# Launch Isaac Sim with streaming enabled
./isaac-sim.sh --enable-livestream --livestream-port 8211
```

### اپنے براؤزر سے منسلک ہوں (Connect from Your Browser)

<div dir="rtl">

1.  اپنے براؤزر (browser) کو کھولیں اور `http://<INSTANCE_IP>:8211/streaming/client` پر جائیں
2.  آپ کو آئزک سم (Isaac Sim) ویو پورٹ (viewport) ریئل ٹائم (real-time) میں رینڈر (render) ہوتا ہوا نظر آئے گا

</div>

:::tip فائر وال قواعد (Firewall Rules)
<div dir="rtl">

یقینی بنائیں کہ پورٹ (port) 8211 آپ کے کلاؤڈ فراہم کنندہ کے فائر وال (cloud provider's firewall)/سیکیورٹی گروپ سیٹنگز (security group settings) میں کھلا ہے۔ لیمبڈا لیبز (Lambda Labs) پر، تمام پورٹس بطور ڈیفالٹ (default) کھلے ہوتے ہیں۔ اے ڈبلیو ایس (AWS)/جی سی پی (GCP) پر، آپ کو ٹی سی پی پورٹ (TCP port) 8211 کے لیے واضح طور پر ایک ان باؤنڈ رول (inbound rule) شامل کرنا ہوگا۔

</div>
:::

<div dir="rtl">

Isaac Sim کے بارے میں مزید تفصیلات کے لیے، [باب 8: این ویڈیا آئزک پلیٹ فارم](/docs/module-3/ch08-nvidia-isaac) دیکھیں۔

</div>

## تصدیق (Verification)

<div dir="rtl">

اپنے کلاؤڈ ماحول (cloud environment) کے فعال (operational) ہونے کی تصدیق کے لیے یہ چیکس (checks) چلائیں۔

</div>

```bash
# 1. Verify SSH connection
ssh -i ~/.ssh/lambda_key ubuntu@<INSTANCE_IP> "echo 'SSH: OK'"
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
SSH: OK
```

```bash
# 2. Verify GPU on cloud VM (run on the VM)
nvidia-smi --query-gpu=name,memory.total --format=csv,noheader
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

```
NVIDIA A10G, 24576 MiB
```

```bash
# 3. Verify ROS 2 on cloud VM
ros2 doctor --report | head -5
```

<div dir="rtl">

متوقع آؤٹ پٹ:

</div>

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

## خرابیوں کا ازالہ (Troubleshooting)

### مسئلہ 1: ایس ایس ایچ کنکشن مسترد ہو گیا (SSH connection refused)

<div dir="rtl">

**وجہ:** انسٹینس (instance) شروع نہیں ہوا ہوگا، یا ایس ایس ایچ پورٹ (SSH port) (22) بلاک (blocked) ہے۔

</div>

<div dir="rtl">

**حل:**

</div>

<div dir="rtl">

*   تصدیق کریں کہ انسٹینس (instance) آپ کے کلاؤڈ ڈیش بورڈ (cloud dashboard) میں چل رہا ہے
*   آئی پی ایڈریس (IP address) کی درستگی کی تصدیق کریں
*   کنیکٹیویٹی (connectivity) کی جانچ کریں:

</div>

```bash
ping <INSTANCE_IP>
```

<div dir="rtl">

*   اگر پِنگ (ping) کام کرتا ہے لیکن ایس ایس ایچ (SSH) نہیں، تو فائر وال (firewall) کی جانچ کریں:
    *   لیمبڈا لیبز (Lambda Labs): ایس ایس ایچ (SSH) بطور ڈیفالٹ (default) کھلا ہوتا ہے
    *   اے ڈبلیو ایس (AWS): پورٹ (port) 22 کے ان باؤنڈ رول (inbound rule) کے لیے سیکیورٹی گروپ (Security Group) کی جانچ کریں
    *   جی سی پی (GCP): ایس ایس ایچ الاؤ (ssh-allow) کے لیے فائر وال رولز (Firewall Rules) کی جانچ کریں

</div>

### مسئلہ 2: کلاؤڈ وی ایم پر این ویڈیا ڈرائیور نہیں ملا (NVIDIA driver not found on cloud VM)

<div dir="rtl">

**وجہ:** کچھ کلاؤڈ امیجز (cloud images) میں پری انسٹالڈ این ویڈیا ڈرائیورز (pre-installed NVIDIA drivers) شامل نہیں ہوتے۔

</div>

<div dir="rtl">

**حل:**

</div>

```bash
# Install NVIDIA driver on the cloud VM
sudo apt update
sudo apt install -y nvidia-driver-535
sudo reboot
# Reconnect via SSH after reboot
nvidia-smi
```

### مسئلہ 3: کلاؤڈ اور مقامی مشین کے درمیان آر او ایس ٹو ٹاپکس نظر نہیں آ رہے (ROS 2 topics not visible between cloud and local machine)

<div dir="rtl">

**وجہ:** ڈی ڈی ایس ملٹی کاسٹ (DDS multicast) نیٹ ورکس (networks) پر کام نہیں کرتا۔

</div>

<div dir="rtl">

**حل:**

</div>

<div dir="rtl">

سیکشن سی 4 میں بیان کردہ زینوہ برج (Zenoh bridge) استعمال کریں۔ متبادل طور پر، سائیکلون ڈی ڈی ایس (CycloneDDS) کو واضح پیئر ایڈریسز (explicit peer addresses) کے ساتھ کنفیگر (configure) کریں:

</div>

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

### مسئلہ 4: آئزک سم سٹریمنگ ایک کالی سکرین دکھاتی ہے (Isaac Sim streaming shows a black screen)

<div dir="rtl">

**وجہ:** جی پی یو (GPU) شاید صحیح طریقے سے رینڈرنگ (rendering) نہیں کر رہا ہے، یا سٹریمنگ پورٹ (streaming port) بلاک (blocked) ہے۔

</div>

<div dir="rtl">

**حل:**

</div>

<div dir="rtl">

1.  تصدیق کریں کہ جی پی یو (GPU) اوور لوڈڈ (overloaded) نہیں ہے: `nvidia-smi` میں میموری (memory) کا استعمال 90% سے کم ہونا چاہیے
2.  جانچ کریں کہ پورٹ (port) 8211 آپ کی فائر وال سیٹنگز (firewall settings) میں کھلا ہے
3.  ایک مختلف براؤزر (browser) آزمائیں (کروم (Chrome) ویب آر ٹی سی سٹریمنگ (WebRTC streaming) کے ساتھ بہترین کام کرتا ہے)
4.  وربوز لاگنگ (verbose logging) کے ساتھ آئزک سم (Isaac Sim) کو دوبارہ سٹارٹ کریں:

</div>

```bash
./isaac-sim.sh --enable-livestream --livestream-port 8211 --verbose
```

## اگلے اقدامات (Next Steps)

<div dir="rtl">

آپ کے کلاؤڈ لیب (cloud lab) کے کنفیگرڈ (configured) ہونے کے بعد، آپ درسی کتاب (textbook) کے کسی بھی باب پر جا سکتے ہیں۔ خاص طور پر Isaac Sim مشقیں (exercises) کے لیے، [باب 8: این ویڈیا آئزک پلیٹ فارم](/docs/module-3/ch08-nvidia-isaac) دیکھیں۔ ٹرینڈ ماڈلز (trained models) کو فزیکل ہارڈ ویئر (physical hardware) پر ڈیپلائی (deploy) کرنے کے لیے، [ضمیمہ ڈی: این ویڈیا جیٹسن ڈیپلائمنٹ](./a4-jetson-deployment.md) دیکھیں۔

</div>
---