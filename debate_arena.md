# 🗣️ **DebateArena** - Micropayment-Powered Discussion Game

## Core Concept
A gamified debate platform where players use micropayments to participate, vote, and earn rewards. Think "Reddit meets debate club" with real economic incentives powered by TODAQ Micro.

## Original Game Mechanics
- Every player starts with equal amount of digital quantity (DQ)
- Random topic suggested for debate
- Players pay fixed amount to make arguments
- Others pay to upvote/downvote comments
- **Participant scores hidden during gameplay** (prevents bandwagon voting)
- Game ends when players run out of DQ
- Winner: highest upvote ratio revealed at end

## Enhanced TODAQ Micro Integration

### 🎯 **TODAQ Elements Used**
- **Payment Elements**: Entry fees, argument posting, voting costs
- **Persona Delegation**: Debate skill levels, topic expertise, community standing
- **Verify Elements**: Access exclusive debates, expert-only rounds
- **Payback Elements**: Winner rewards, community contributions, moderation rewards

## 💰 **Economic Flow Design**

### Entry & Participation
```javascript
// Game entry fee
const gameEntry = await elements.create('payment', {
  hash: 'DEBATE_ENTRY_FEE', 
  cost: 1.00,
  theme: 'light'
});

// Argument posting cost
const argumentPost = await elements.create('payment', {
  hash: 'ARGUMENT_POST', 
  cost: 0.25,
  theme: 'light'
});

// Voting costs (upvote/downvote)
const vote = await elements.create('payment', {
  hash: 'VOTE_COST', 
  cost: 0.10,
  theme: 'light'
});
```

### Reward Distribution
```javascript
// Winner payback (70% of pot)
const winnerReward = await elements.create('payback', {
  hash: 'WINNER_REWARD_COMMODITY',
  theme: 'dark'
});

// Participation rewards (20% of pot)
const participationReward = await elements.create('payback', {
  hash: 'PARTICIPATION_COMMODITY',
  theme: 'light'
});

// Platform fee (10% of pot)
```

## 🏆 **Persona System & Progression**

### Debate Skill Personas
After payment validation, delegate skill-based personas:

```javascript
// Server-side persona delegation after game completion
if (await micro.Payment.validPayment(accessToken, hash, nonce, timestamp)) {
  let personaHash;
  
  if (upvoteRatio >= 0.8) {
    personaHash = "MASTER_DEBATER_PERSONA";
  } else if (upvoteRatio >= 0.6) {
    personaHash = "SKILLED_DEBATER_PERSONA"; 
  } else if (gamesPlayed >= 1) {
    personaHash = "NOVICE_DEBATER_PERSONA";
  }
  
  await micro.Persona.delegatePersona({
    hash: personaHash, 
    hostname, 
    name, 
    email
  });
}
```

### Topic Expertise Personas
- **POLITICS_EXPERT**: Win 3+ political debates
- **TECH_EXPERT**: Win 3+ technology debates  
- **PHILOSOPHY_EXPERT**: Win 3+ philosophy debates

### Community Standing Personas
- **FAIR_VOTER**: Vote in 10+ debates without bias
- **ACTIVE_PARTICIPANT**: Complete 25+ debates
- **COMMUNITY_MODERATOR**: Successfully moderate 5+ debates

## 🔒 **Verify Element Access Control**

### Premium Debate Tiers
```javascript
// Expert-only debate access
const expertDebate = await elements.create('verify', {
  hash: 'EXPERT_DEBATE_PERSONA',
  theme: 'dark',
  trailing: 'Verify Expert Status',
  issueMin: 1, // Must have at least 1 expert persona
  issueMax: 3  // Any of the 3 expert types qualify
});

// High-stakes debate (masters only)
const masterDebate = await elements.create('verify', {
  hash: 'MASTER_DEBATER_PERSONA', 
  theme: 'dark',
  trailing: 'Masters Tournament Entry',
  issueMin: 1,
  issueMax: 1
});

// Moderated discussions (community moderators)
const moderatedDebate = await elements.create('verify', {
  hash: 'COMMUNITY_MODERATOR_PERSONA',
  theme: 'light', 
  trailing: 'Verify Moderator Status'
});
```

## 🏗️ **Technical Architecture**

### Core Components

#### 1. **Twin & Commodity Setup**
```bash
# Create platform Twin (receives platform fees)
curl -X POST "https://pay.m.todaq.net/v2/twin/" \
-H "Authorization: Bearer $ACCESS_TOKEN" \
-d '{"dq": "USD_DQ_HASH"}'

# Create game commodities
curl -X POST "https://pay.m.todaq.net/v2/commodity/" \
-d '{"descriptor": "DEBATE_ENTRY_FEE", "cost": 1.00, "twin_id": PLATFORM_TWIN_ID}'

curl -X POST "https://pay.m.todaq.net/v2/commodity/" \
-d '{"descriptor": "ARGUMENT_POST", "cost": 0.25, "twin_id": PLATFORM_TWIN_ID}'

curl -X POST "https://pay.m.todaq.net/v2/commodity/" \
-d '{"descriptor": "VOTE_COST", "cost": 0.10, "twin_id": PLATFORM_TWIN_ID}'
```

#### 2. **Database Schema**
```sql
-- Games table
CREATE TABLE debates (
  id UUID PRIMARY KEY,
  topic TEXT NOT NULL,
  status ENUM('waiting', 'active', 'ended'),
  pot_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Players in game
CREATE TABLE debate_participants (
  id UUID PRIMARY KEY,
  debate_id UUID REFERENCES debates(id),
  player_twin_hostname TEXT NOT NULL,
  entry_fee_paid BOOLEAN DEFAULT FALSE,
  final_upvote_ratio DECIMAL(3,2),
  final_rank INTEGER
);

-- Arguments posted
CREATE TABLE arguments (
  id UUID PRIMARY KEY,
  debate_id UUID REFERENCES debates(id),
  player_hostname TEXT NOT NULL,
  content TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  payment_hash TEXT NOT NULL,
  scores_hidden BOOLEAN DEFAULT TRUE, -- Hide scores during active debate
  created_at TIMESTAMP DEFAULT NOW()
);

-- Votes cast  
CREATE TABLE votes (
  id UUID PRIMARY KEY,
  argument_id UUID REFERENCES arguments(id),
  voter_hostname TEXT NOT NULL,
  vote_type ENUM('up', 'down'),
  payment_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. **Game Flow API Endpoints**

```javascript
// POST /api/debates - Create new debate
// GET /api/debates/active - List active debates  
// POST /api/debates/:id/join - Join debate (requires entry payment)
// POST /api/debates/:id/arguments - Post argument (requires payment)
// POST /api/arguments/:id/vote - Vote on argument (requires payment)
// GET /api/debates/:id/arguments - Get arguments (scores hidden during active debate)
// POST /api/debates/:id/end - End debate, reveal scores, distribute rewards
// GET /api/debates/:id/results - Get final results with revealed scores
```

#### 4. **Payment Event Handlers**

```javascript
// Entry fee payment handler
document.addEventListener('payment', async (event) => {
  const { hash, hostname, nonce, timestamp } = event.detail;
  
  // Validate payment
  const isValid = await fetch('/api/validate-entry', {
    method: 'POST',
    body: JSON.stringify({ hash, hostname, nonce, timestamp })
  });
  
  if (isValid.ok) {
    // Add player to debate
    await addPlayerToDebate(debateId, hostname);
    showDebateInterface();
  }
});

// Vote payment handler  
document.addEventListener('payment', async (event) => {
  const { hash, hostname, nonce, timestamp } = event.detail;
  
  const response = await fetch('/api/process-vote', {
    method: 'POST',
    body: JSON.stringify({
      argumentId,
      voteType, 
      hash, 
      hostname, 
      nonce, 
      timestamp
    })
  });
  
  if (response.ok) {
    // Update vote count indicators (without revealing scores)
    updateVoteIndicators(); 
    updatePlayerBalance();
    // Scores remain hidden until debate ends
  }
});

// Score reveal handler (when debate ends)
document.addEventListener('debateEnded', async (event) => {
  const { debateId } = event.detail;
  
  // Fetch and display final results with revealed scores
  const results = await fetch(`/api/debates/${debateId}/results`);
  const data = await results.json();
  
  // Animate score reveals and show winner
  revealScoresAnimation(data.arguments);
  showWinner(data.winner);
  distributePrizes(data.rewards);
});
```

## 🚀 **Iterative Implementation Plan**

### **🎯 MVP (2-3 hours) - Core Proof of Concept**
**Goal**: Demonstrate basic micropayment-powered debate mechanics

- [ ] **Setup TODAQ Account** (15 min)
  - Create account, get API keys
  - Create single commodity for "debate participation" ($0.50)
  
- [ ] **Minimal Frontend** (45 min)
  - Single HTML page with TODAQ SDK
  - Topic display: "Should AI replace human jobs?"
  - Text area for arguments
  - Payment button to submit argument
  
- [ ] **Basic Backend** (60 min)
  - Node.js server with single endpoint `/submit-argument`
  - In-memory storage (array of arguments)
  - Payment validation with TODAQ
  - Return success/failure response
  
- [ ] **Simple Display** (30 min)
  - Show submitted arguments in list
  - No voting, no scores - just payment → post → display
  - Basic CSS for readability

**MVP Demo**: "Pay $0.50 → Post argument → See it appear in list"

---

### **🔄 Iteration 1 (2-3 hours) - Add Voting**
**Goal**: Enable paid voting with hidden scores

- [ ] **Add Voting Commodities** (15 min)
  - Create upvote commodity ($0.10)
  - Create downvote commodity ($0.10)
  
- [ ] **Voting UI** (45 min)
  - Add upvote/downvote buttons to each argument
  - Payment elements for vote transactions
  - Vote confirmation feedback
  
- [ ] **Vote Processing** (60 min)
  - `/vote` endpoint with payment validation
  - Store votes in memory with argument IDs
  - Track vote counts (hidden from display)
  
- [ ] **Vote Indicators** (30 min)
  - Show "X people voted" without revealing up/down counts
  - Visual feedback that voting happened
  - Keep scores completely hidden

**Iteration 1 Demo**: "Submit arguments → Others can pay to vote → See voting activity"

---

### **🎮 Iteration 2 (2-3 hours) - Game Mechanics**
**Goal**: Turn into actual game with winners

- [ ] **Game Sessions** (30 min)
  - Add game ID concept
  - 5-minute timer for arguments
  - 5-minute timer for voting
  
- [ ] **Score Reveal** (45 min)
  - Calculate upvote ratios when game ends
  - Animate score reveals
  - Show winner announcement
  
- [ ] **Payback System** (60 min)
  - Create winner reward commodity
  - Implement payback element for winner
  - Basic prize distribution (70% to winner)
  
- [ ] **Game Flow** (45 min)
  - "Start New Game" button
  - Game status display (arguing phase → voting phase → results)
  - Reset for next round

**Iteration 2 Demo**: "Complete game cycle with winner announcement and rewards"

---

### **🏆 Iteration 3 (3-4 hours) - Personas & Progression**
**Goal**: Add skill progression system

- [ ] **Basic Personas** (60 min)
  - Create 3 persona commodities (Novice, Skilled, Master)
  - Server-side persona delegation logic
  - Track games played and win rates
  
- [ ] **Persona Display** (45 min)
  - Show player's current skill level
  - Badge/icon system for personas
  - Progress indicators
  
- [ ] **Verify Elements** (60 min)
  - Create "Expert Debate" mode
  - Verify element requiring Skilled+ persona
  - Higher stakes ($2 entry, $5 winner prize)
  
- [ ] **Player Profiles** (45 min)
  - Simple profile page showing stats
  - Games played, win rate, current persona
  - Argument history

**Iteration 3 Demo**: "Skill progression with exclusive expert debates"

---

### **🌟 Iteration 4 (3-4 hours) - Polish & Scale**
**Goal**: Production-ready experience

- [ ] **Database Integration** (90 min)
  - Replace in-memory storage with PostgreSQL
  - Proper data persistence
  - User session management
  
- [ ] **Real-time Updates** (60 min)
  - WebSocket integration
  - Live player count
  - Real-time argument submissions
  
- [ ] **UI Polish** (90 min)
  - Professional styling with Tailwind
  - Animations and transitions
  - Mobile responsiveness
  
- [ ] **Multiple Topics** (30 min)
  - Topic rotation system
  - Random topic selection
  - Topic categories

**Iteration 4 Demo**: "Full-featured platform ready for multiple users"

---

### **🎪 Iteration 5 (Optional - Advanced Features)**
**Goal**: Competitive tournament features

- [ ] **Tournament Brackets** (2 hours)
  - Multi-round elimination
  - Tournament personas
  - Championship rewards
  
- [ ] **Topic Expertise** (1.5 hours)
  - Category-specific personas
  - Expert verification per topic
  - Specialized debate rooms
  
- [ ] **Advanced Analytics** (1 hour)
  - Player statistics dashboard
  - Argument quality metrics
  - Community leaderboards

---

## **⚡ Quick Start Guide**

### **Hour 1: Get Something Working**
```bash
# 1. Clone starter template
npx create-next-app@latest debate-arena
cd debate-arena

# 2. Install TODAQ SDK
npm install @todaqmicro/payment-js

# 3. Create single page with payment button
# 4. Set up TODAQ account and get first payment working
```

### **Hour 2: Basic Argument System**
```bash
# 1. Add Node.js backend
# 2. Create /submit-argument endpoint
# 3. Store arguments in memory
# 4. Display submitted arguments
```

### **Hour 3: MVP Demo Ready**
```bash
# 1. Style with basic CSS
# 2. Add topic display
# 3. Test full flow: pay → submit → display
# 4. Deploy to Vercel for demo
```

**Each iteration builds on the previous one, allowing you to have a working demo at any stage!**

### **Tech Stack Recommendation**
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io or Server-Sent Events
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (frontend) + Railway (backend)

### **MVP Features for Demo**
✅ **Core Game Loop**: Entry → Argue → Vote → Win  
✅ **Micropayment Integration**: All 4 TODAQ elements working  
✅ **Basic Persona System**: 3 skill levels  
✅ **Reward Distribution**: Winner gets 70% of pot  
✅ **Live Demo**: 2-3 people can play simultaneously  

### **Demo Script (5 minutes)**
1. **Setup** (30s): "DebateArena - Reddit meets micropayments"
2. **Join Game** (60s): Show entry fee payment, random topic generation
3. **Play Round** (90s): Players post arguments, vote on others
4. **Show Personas** (60s): Demonstrate skill progression, expert verification
5. **Rewards** (60s): Winner gets payback, show economic sustainability
6. **Future Vision** (30s): Tournament modes, expert debates, community moderation

### **Judges' Appeal Points**
- 🎯 **Novel Use Case**: First gamified debate platform with micropayments
- 💰 **Sustainable Economics**: Self-funding through participation fees
- 🏆 **Skill Progression**: Meaningful persona system creates retention
- 🔒 **Access Control**: Verify elements create premium experiences
- 🎭 **Fair Play Innovation**: Hidden scores prevent bandwagon voting bias
- 📈 **Scalability**: Tournament brackets, expert certifications, topic specialization

### **Post-Hackathon Roadmap**
- Mobile app with push notifications
- AI-powered argument analysis and scoring
- Integration with real news events
- University partnerships for academic debates
- NFT certificates for debate champions
