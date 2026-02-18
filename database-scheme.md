# RiskRadar – Entity Relationship Design

## 📌 Entities

The system contains the following core entities:

1. **User**
2. **Transaction**
3. **Location**
4. **Device**

---

# 📊 Entity Relationships

## 1️⃣ User → Transaction (Performs)

**Relationship Type:** One-to-Many (1:N)

* A **User** can perform multiple **Transactions**.
* Each **Transaction** is performed by exactly one **User**.

**Meaning:**
A user initiates transactions (e.g., sending money, making payments).

---

## 2️⃣ User → Transaction (Receives)

**Relationship Type:** One-to-Many (1:N)

* A **User** can receive multiple **Transactions**.
* Each **Transaction** has exactly one receiving **User**.

**Meaning:**
A user can receive funds from multiple transactions.

---

## 3️⃣ User → Device

**Relationship Type:** One-to-Many (1:N)

* A **User** can use multiple **Devices**.
* Each **Device** is associated with one primary **User**.

**Meaning:**
Users may perform transactions from multiple devices (mobile, laptop, tablet).

---

## 4️⃣ User → Location (Home Location)

**Relationship Type:** Many-to-One (N:1)

* Multiple **Users** can reside in the same **Location**.
* Each **User** has one primary home location.

**Meaning:**
Users may share the same residential location (e.g., city or region).

---

## 5️⃣ User → Location (Work Location)

**Relationship Type:** Many-to-One (N:1)

* Multiple **Users** can share the same work location.
* Each **User** has one primary work location.

**Meaning:**
Users may work in the same office or business area.

---

## 6️⃣ Transaction → Location

**Relationship Type:** Many-to-One (N:1)

* Multiple **Transactions** can occur at the same **Location**.
* Each **Transaction** is performed at one specific location.

**Meaning:**
A transaction is linked to the geographic location where it occurred.

---

## 7️⃣ Transaction → Device

**Relationship Type:** Many-to-One (N:1)

* Multiple **Transactions** can be performed using the same **Device**.
* Each **Transaction** is executed from one specific device.

**Meaning:**
A device can be reused for multiple transactions.

---

## 8️⃣ Location → Device

**Relationship Type:** One-to-Many (1:N)

* One **Location** can have multiple **Devices**.
* Each **Device** is associated with one location.

**Meaning:**
Devices are physically located in a specific place when transactions occur.

---

# 🏗 Conceptual Summary

* A **User** performs and receives **Transactions**.
* A **User** uses one or more **Devices**.
* A **User** has a home and work **Location**.
* A **Transaction** is tied to both a **Device** and a **Location**.
* A **Device** exists at a **Location**.

---

# 🎯 Purpose in RiskRadar

This relational structure enables:

* Velocity detection per user
* Device anomaly detection
* Location change detection
* Multi-account device/IP monitoring
* Behavioral profiling for fraud scoring

