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

## 🚀 **Hackathon Implementation Plan**

### **Day 1: Foundation (8 hours)**
- [ ] Set up TODAQ Micro account and get API keys
- [ ] Create platform Twin and core commodities (entry, argument, vote)
- [ ] Build basic React/Next.js app with TODAQ SDK integration
- [ ] Implement payment elements for entry fees
- [ ] Create simple debate room UI

### **Day 2: Core Game Logic (8 hours)**
- [ ] Build argument posting with payment validation
- [ ] Implement voting system with micropayments
- [ ] **Implement hidden scoring system** (votes count but scores not displayed)
- [ ] Create game end conditions and **score reveal logic**
- [ ] Add basic persona delegation (novice → skilled → master)
- [ ] Build reward distribution with payback elements

### **Day 3: Polish & Advanced Features (8 hours)**
- [ ] Add verify elements for expert debates
- [ ] Implement topic expertise personas
- [ ] Build leaderboards and player profiles
- [ ] Add real-time updates (WebSocket/Server-Sent Events)
- [ ] Create demo data and polish UI/UX

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
