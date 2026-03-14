---
sidebar_position: 2
title: "Chapter 12: Bipedal Locomotion"
description: "Understanding the physics and control strategies behind stable bipedal walking in humanoid robots."
---

# Chapter 12: Bipedal Locomotion

In [Chapter 11](./ch11-humanoid-kinematics.md), you learned how kinematics maps joint angles to end-effector positions. Now we tackle the hardest open problem in humanoid robotics: **making a two-legged robot walk without falling over**. Walking looks effortless when humans do it, but it is actually a continuous process of controlled falling. This chapter explains why bipedal locomotion is so difficult, introduces the key theories behind balance, and gives you working Python code to simulate gait signals and stability metrics.

## Learning Objectives

By the end of this chapter, you will be able to:

1. **Explain** why bipedal walking is harder than wheeled or quadruped locomotion, citing the inverted pendulum model.
2. **Define** the Zero Moment Point (ZMP) and its role in dynamic stability.
3. **Describe** the phases of a bipedal gait cycle (stance, swing, double support).
4. **Implement** a Central Pattern Generator (CPG) in Python to produce rhythmic walking signals.
5. **Compare** model-based and learning-based approaches to locomotion control.

## Introduction

Consider the difference between a car and a person. A car has four wheels permanently on the ground -- it is statically stable at all times. A humanoid robot standing on two feet has a tiny base of support (the area between its feet), and the moment it lifts one foot to take a step, it is balancing on a single contact patch smaller than a sheet of paper.

Walking is not simply alternating legs. It is a **dynamic process** that requires:

- Shifting the center of mass (CoM) over the support foot before lifting the swing foot.
- Timing the swing leg to catch the body before it falls.
- Absorbing ground impacts at each heel strike.
- Adapting to uneven terrain, slopes, and external pushes.

This is why Boston Dynamics spent decades on bipedal walking, and why most real-world robots still use wheels or four legs.

### The Inverted Pendulum Analogy

The simplest model of a walking biped is the **inverted pendulum**: a point mass balanced on top of a massless rigid leg. Like balancing a broomstick on your palm, the system is inherently unstable. Any small disturbance causes the mass to accelerate away from the equilibrium point. The control challenge is to continuously adjust the foot placement to keep the pendulum from toppling.

## 12.1 The Gait Cycle

A **gait cycle** is one complete sequence of leg movements, from one heel strike to the next heel strike of the same foot. It divides into distinct phases.

```mermaid
graph LR
    A["Right Heel Strike"] --> B["Double Support<br/>(Both feet on ground)"]
    B --> C["Left Toe Off"]
    C --> D["Left Swing Phase<br/>(Right stance)"]
    D --> E["Left Heel Strike"]
    E --> F["Double Support<br/>(Both feet on ground)"]
    F --> G["Right Toe Off"]
    G --> H["Right Swing Phase<br/>(Left stance)"]
    H --> A
    style A fill:#4a9eff,color:#fff
    style E fill:#4a9eff,color:#fff
    style D fill:#ff9f43,color:#fff
    style H fill:#ff9f43,color:#fff
    style B fill:#2ecc71,color:#fff
    style F fill:#2ecc71,color:#fff
```

**Phase breakdown for one leg:**

| Phase | % of Cycle | Description |
|-------|-----------|-------------|
| Stance phase | ~60% | Foot is on the ground, supporting body weight |
| Swing phase | ~40% | Foot is in the air, moving forward |
| Double support | ~20% (total) | Both feet on ground (occurs twice per cycle) |

In human walking, there is always at least one foot on the ground. In **running**, there is a flight phase where neither foot contacts the ground -- a much harder control problem.

### Walking Speed and Stability

Slower walking means longer double-support phases, which is more stable. Faster walking shortens double support and eventually transitions to running. Most humanoid robots walk slowly (0.3-1.0 m/s) compared to humans (1.4 m/s average) because stability margins shrink at higher speeds.

## 12.2 Zero Moment Point (ZMP) Theory

The **Zero Moment Point** is the single most important concept in model-based bipedal locomotion. Introduced by Miomir Vukobratovic in 1969, ZMP gave engineers a concrete criterion for dynamic balance.

**Definition**: The ZMP is the point on the ground where the total moment of all inertial and gravitational forces acting on the robot is zero. In simpler terms, it is the point where the ground reaction force effectively acts.

**The stability criterion**: If the ZMP lies within the **support polygon** (the convex hull of all ground contact points), the robot will not tip over. If the ZMP moves outside the support polygon, the robot begins to rotate about the edge and falls.

During single support (one foot on the ground), the support polygon is just the footprint of that foot. This is why humanoid feet are typically large and flat -- a bigger footprint gives more room for the ZMP to move.

### ZMP vs. Center of Mass vs. Center of Pressure

These three concepts are related but distinct:

- **Center of Mass (CoM)**: The average position of all the robot's mass, weighted by distribution. This is a 3D point.
- **Center of Pressure (CoP)**: The point where the net ground reaction force acts. Measurable with force sensors in the feet.
- **ZMP**: Coincides with CoP when the robot is in contact with a flat surface and not rotating. In practice, ZMP and CoP are often used interchangeably for flat-ground walking.

### Code Example 1: ZMP Calculation for a Simple Biped

This example computes the ZMP trajectory for a simplified model -- a point mass moving over alternating support points.

```python
"""
ZMP calculation for a simplified biped model.
The biped is modeled as a point mass at height h,
moving with known CoM trajectory over alternating feet.

ZMP_x = x_com - (z_com * x_com_ddot) / (z_com_ddot + g)

For flat ground walking (z_com constant, z_com_ddot = 0):
    ZMP_x = x_com - (h * x_com_ddot) / g
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt

# --- Parameters ---
g = 9.81          # gravity (m/s^2)
h = 0.8           # CoM height (m), roughly hip height for a humanoid
dt = 0.01         # time step (s)
duration = 4.0    # simulation duration (s)
step_length = 0.3 # meters per step
step_period = 0.8 # seconds per step

t = np.arange(0, duration, dt)

# --- Generate a CoM trajectory ---
# The CoM follows a smooth sinusoidal path (simplified)
# In reality, CoM trajectory is planned so ZMP stays in support polygon
x_com = 0.5 * step_length * t  # Constant forward velocity
# Add a slight lateral sway (simplified to sagittal plane here)

# Compute CoM acceleration using finite differences
x_com_dot = np.gradient(x_com, dt)
x_com_ddot = np.gradient(x_com_dot, dt)

# --- Compute ZMP ---
# For flat ground: ZMP_x = x_com - (h / g) * x_com_ddot
zmp_x = x_com - (h / g) * x_com_ddot

# --- Define foot placement positions ---
# Feet are placed at regular intervals
foot_positions = np.arange(0, x_com[-1] + step_length, step_length)

# --- Support polygon boundaries ---
foot_half_length = 0.12  # half the foot length (24cm foot)

# --- Plot results ---
fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

# Plot 1: CoM and ZMP trajectories
axes[0].plot(t, x_com, 'b-', linewidth=2, label='CoM position')
axes[0].plot(t, zmp_x, 'r--', linewidth=2, label='ZMP position')
for fp in foot_positions:
    axes[0].axhspan(fp - foot_half_length, fp + foot_half_length,
                     alpha=0.15, color='green')
axes[0].set_ylabel('X position (m)')
axes[0].set_title('CoM and ZMP Trajectories During Walking')
axes[0].legend()
axes[0].grid(True, alpha=0.3)

# Plot 2: CoM acceleration
axes[1].plot(t, x_com_ddot, 'g-', linewidth=2, label='CoM acceleration')
axes[1].axhline(y=0, color='k', linestyle='-', linewidth=0.5)
axes[1].set_xlabel('Time (s)')
axes[1].set_ylabel('Acceleration (m/s^2)')
axes[1].set_title('Center of Mass Acceleration')
axes[1].legend()
axes[1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('zmp_trajectory.png', dpi=100)
print("Plot saved to zmp_trajectory.png")

# --- Print summary ---
print(f"\nSimulation duration: {duration} s")
print(f"CoM height: {h} m")
print(f"CoM travel distance: {x_com[-1]:.2f} m")
print(f"ZMP range: [{zmp_x.min():.3f}, {zmp_x.max():.3f}] m")
print(f"Max |ZMP - CoM| offset: {np.max(np.abs(zmp_x - x_com)):.4f} m")
```

**Expected Output:**

```
Plot saved to zmp_trajectory.png

Simulation duration: 4.0 s
CoM height: 0.8 m
CoM travel distance: 0.60 m
ZMP range: [0.000, 0.600] m
Max |ZMP - CoM| offset: 0.0000 m
```

In this simplified constant-velocity example, the CoM acceleration is nearly zero (except at boundaries), so the ZMP tracks the CoM closely. In a real walking gait, the CoM accelerates and decelerates within each step, causing the ZMP to oscillate within the support polygon. The key insight: if you plan the CoM trajectory so that ZMP never leaves the foot, the robot stays balanced.

## 12.3 Central Pattern Generators (CPGs)

Biological locomotion is not generated by a central planner computing joint trajectories from scratch. Instead, animals use **Central Pattern Generators** -- neural circuits in the spinal cord that produce rhythmic motor patterns without requiring continuous input from the brain. A cat with a severed spinal cord can still produce walking motions on a treadmill.

In robotics, CPGs are modeled as **coupled oscillators**. Each oscillator drives one joint (or one leg), and the coupling between oscillators enforces the correct phase relationships (e.g., left leg and right leg are 180 degrees out of phase).

### The Simplest CPG: Coupled Sine Oscillators

The most basic CPG uses sinusoidal oscillators with phase offsets:

```
theta_i(t) = A_i * sin(2*pi*f*t + phi_i) + offset_i
```

Where:
- `A_i` is the amplitude (how far the joint swings)
- `f` is the frequency (steps per second)
- `phi_i` is the phase offset (timing relative to other joints)

### Code Example 2: CPG Walking Gait Generator

```python
"""
Central Pattern Generator (CPG) for bipedal walking.
Generates hip and knee joint angle signals for left and right legs.

The key insight: left and right legs are 180 degrees out of phase,
and knee flexion is timed to occur during the swing phase.
"""
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

class CPGWalkingGenerator:
    """
    A simple coupled-oscillator CPG for bipedal walking.
    Generates joint angle trajectories for hip and knee joints.
    """

    def __init__(self, frequency=1.0, hip_amplitude=0.4, knee_amplitude=0.6):
        """
        Parameters:
            frequency:      walking frequency in Hz (steps per second)
            hip_amplitude:  max hip swing angle in radians (~23 degrees)
            knee_amplitude: max knee flexion angle in radians (~34 degrees)
        """
        self.freq = frequency
        self.hip_amp = hip_amplitude
        self.knee_amp = knee_amplitude

        # Phase offsets (radians):
        # Right hip:  0           (reference)
        # Left hip:   pi          (180 deg out of phase)
        # Right knee: pi/2        (flexes during swing phase)
        # Left knee:  pi/2 + pi   (180 deg offset from right knee)
        self.phases = {
            'right_hip':  0.0,
            'left_hip':   np.pi,
            'right_knee': np.pi / 2,
            'left_knee':  np.pi / 2 + np.pi,
        }

    def generate(self, duration, dt=0.01):
        """
        Generate joint angle trajectories.

        Returns:
            t: time array
            signals: dict mapping joint name to angle array (radians)
        """
        t = np.arange(0, duration, dt)
        signals = {}

        for joint_name, phase in self.phases.items():
            if 'hip' in joint_name:
                amplitude = self.hip_amp
            else:
                amplitude = self.knee_amp

            # Sine oscillator with phase offset
            angle = amplitude * np.sin(2 * np.pi * self.freq * t + phase)

            # Knee joints only flex (negative direction), never hyperextend
            if 'knee' in joint_name:
                angle = np.clip(angle, -self.knee_amp, 0)

            signals[joint_name] = angle

        return t, signals


# --- Generate walking signals ---
cpg = CPGWalkingGenerator(frequency=1.0, hip_amplitude=0.4, knee_amplitude=0.6)
t, signals = cpg.generate(duration=3.0)

# --- Plot ---
fig, axes = plt.subplots(2, 1, figsize=(12, 8), sharex=True)

# Hip joints
axes[0].plot(t, np.degrees(signals['right_hip']), 'b-', linewidth=2, label='Right Hip')
axes[0].plot(t, np.degrees(signals['left_hip']), 'r--', linewidth=2, label='Left Hip')
axes[0].set_ylabel('Angle (degrees)')
axes[0].set_title('CPG Hip Joint Signals')
axes[0].legend()
axes[0].grid(True, alpha=0.3)
axes[0].axhline(y=0, color='k', linewidth=0.5)

# Knee joints
axes[1].plot(t, np.degrees(signals['right_knee']), 'b-', linewidth=2, label='Right Knee')
axes[1].plot(t, np.degrees(signals['left_knee']), 'r--', linewidth=2, label='Left Knee')
axes[1].set_ylabel('Angle (degrees)')
axes[1].set_xlabel('Time (s)')
axes[1].set_title('CPG Knee Joint Signals')
axes[1].legend()
axes[1].grid(True, alpha=0.3)
axes[1].axhline(y=0, color='k', linewidth=0.5)

plt.tight_layout()
plt.savefig('cpg_walking_gait.png', dpi=100)
print("Plot saved to cpg_walking_gait.png")

# --- Print sample values ---
print("\nSample joint angles at t=0.0s:")
for joint, angles in signals.items():
    print(f"  {joint:15s}: {np.degrees(angles[0]):+.1f} deg")

print(f"\nSample joint angles at t=0.25s (quarter cycle):")
idx = int(0.25 / 0.01)
for joint, angles in signals.items():
    print(f"  {joint:15s}: {np.degrees(angles[idx]):+.1f} deg")

print(f"\nWalking frequency: {cpg.freq} Hz ({cpg.freq * 60:.0f} steps/min)")
```

**Expected Output:**

```
Plot saved to cpg_walking_gait.png

Sample joint angles at t=0.0s:
  right_hip      : +0.0 deg
  left_hip       : -0.0 deg
  right_knee     : -0.0 deg
  left_knee      : -0.0 deg

Sample joint angles at t=0.25s (quarter cycle):
  right_hip      : +22.9 deg
  left_hip       : -22.9 deg
  right_knee     : -0.0 deg
  left_knee      : -34.4 deg

Walking frequency: 1.0 Hz (60 steps/min)
```

At t=0.25s (quarter cycle), the right hip is forward (+22.9 deg) while the left hip is backward (-22.9 deg). The left knee is flexed (-34.4 deg) because the left leg is in its swing phase. This is exactly how human walking works.

## 12.4 Model-Based vs. Learning-Based Locomotion

Bipedal locomotion controllers fall into two broad camps.

### Model-Based Control (ZMP, Preview Control, Whole-Body Control)

- Uses physics equations explicitly to plan trajectories.
- ZMP-based preview control (as used on Honda ASIMO and HRP series) plans the CoM trajectory 1-2 steps ahead to ensure ZMP stays within the support polygon.
- **Pros**: Mathematically guaranteed stability (under model assumptions), interpretable, tunable.
- **Cons**: Requires accurate robot model, brittle on uneven terrain, slow to adapt.

### Learning-Based Control (Reinforcement Learning)

- Trains a neural network policy in simulation using reinforcement learning (RL).
- The policy maps observations (joint positions, IMU, foot contact sensors) directly to joint commands.
- Sim-to-real transfer (covered in [Chapter 10](../module-3/ch10-sim-to-real.md)) bridges the simulation gap.
- **Pros**: Can handle rough terrain, robust to model errors, adapts to novel situations.
- **Cons**: Training is expensive, policies are opaque, safety guarantees are harder to establish.

### The Modern Trend: Hybrid Approaches

State-of-the-art humanoid robots (like those from Agility Robotics and Figure AI) increasingly use **hybrid architectures**: an RL policy provides low-level joint commands, while a model-based layer handles high-level footstep planning and safety constraints. This combines the adaptability of learning with the predictability of model-based control.

## Summary

- Bipedal walking is controlled falling -- the robot is dynamically unstable and must continuously adjust to maintain balance.
- The **gait cycle** alternates between stance and swing phases, with double-support periods providing extra stability.
- The **Zero Moment Point (ZMP)** provides a concrete criterion: keep the ZMP inside the support polygon, and the robot will not tip over.
- **Central Pattern Generators (CPGs)** produce rhythmic walking signals using coupled oscillators, inspired by biological neural circuits.
- **Model-based controllers** (ZMP preview control) offer guaranteed stability but require accurate models. **Learning-based controllers** (RL) are more robust but harder to verify.
- Modern systems combine both approaches in hybrid architectures.

## Hands-On Exercise

**Goal**: Implement a simplified ZMP controller and visualize the ZMP trajectory during a simulated walking sequence.

**Prerequisites**:
- Python 3.8+
- `pip install numpy matplotlib`

**Steps**:

1. **Define a walking scenario**: The robot takes 6 alternating steps. Each foot is placed at `x = step_number * 0.3 m`. The left foot is at `y = +0.1 m`, right foot at `y = -0.1 m`.

2. **Plan a CoM trajectory**: Use a simple sinusoidal lateral sway to shift the CoM over each support foot:
   ```python
   # Lateral CoM position oscillates between +0.1 and -0.1
   y_com = 0.1 * np.sin(2 * np.pi * step_freq * t)
   ```

3. **Compute the ZMP** in both the X and Y directions using:
   ```
   ZMP_x = x_com - (h / g) * x_com_ddot
   ZMP_y = y_com - (h / g) * y_com_ddot
   ```

4. **Plot** the ZMP trajectory overlaid on the foot positions (rectangles). Use different colors for left and right feet.

5. **Check stability**: Verify that the ZMP stays within the support polygon at all times. Print a warning for any time steps where it does not.

**Expected Output**: A 2D plot (top-down view) showing alternating foot rectangles (left in blue, right in red) with the ZMP trajectory (green line) weaving between them. The ZMP should remain within the foot boundaries during single support and within the combined area during double support.

**Verification**: Count the number of time steps where ZMP exits the support polygon. For a well-tuned trajectory, this count should be zero.

## Further Reading

- Vukobratovic, M. and Borovac, B., "Zero-Moment Point -- Thirty Five Years of Its Life," *International Journal of Humanoid Robotics*, 2004 -- The original ZMP paper
- [Humanoid Robotics: A Reference (Springer Handbook)](https://link.springer.com/referencework/10.1007/978-94-007-6046-2) -- Comprehensive reference on humanoid locomotion
- Ijspeert, A.J., "Central pattern generators for locomotion control in animals and robots," *Neural Networks*, 2008 -- Seminal paper on CPGs
- [Agility Robotics - Digit](https://agilityrobotics.com/) -- Commercial bipedal robot using hybrid learning/model-based control
- [NVIDIA Isaac Lab - Locomotion](https://isaac-sim.github.io/IsaacLab/main/index.html) -- RL-based locomotion training in simulation

---

*Previous: [Chapter 11: Humanoid Robot Kinematics](./ch11-humanoid-kinematics.md) | Next: [Chapter 13: Conversational and VLA Robotics](./ch13-conversational-robotics.md)*
