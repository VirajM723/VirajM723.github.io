/**
 * Viraj Mankani Portfolio - Interactive Scripts
 * Stripe Design Language & Dashboard Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
  initConsoleTabs();
  initProjectFiltering();
  initResumeModal();
  initScrollEffects();
  initMobileMenu();
});

/* ==========================================================================
   1. STRIPE COMPOSITED DEVELOPER CONSOLE
   ========================================================================== */
const consoleData = {
  fastapi: {
    title: 'FastAPI Async Microservices • Tata Communications',
    status: '200 OK • 24.8ms',
    statusDot: 'dot-green',
    code: `<span class="code-comment"># Tata Communications: High-Throughput Async REST Architecture</span>
<span class="code-keyword">from</span> fastapi <span class="code-keyword">import</span> APIRouter, Depends, status
<span class="code-keyword">from</span> sqlalchemy.ext.asyncio <span class="code-keyword">import</span> AsyncSession
<span class="code-keyword">from</span> redis.asyncio <span class="code-keyword">import</span> Redis
<span class="code-keyword">import</span> orjson

router = APIRouter(prefix=<span class="code-str">"/api/v1/telemetry"</span>, tags=[<span class="code-str">"telemetry"</span>])

<span class="code-prop">@router.get</span>(<span class="code-str">"/metrics"</span>, response_model=MetricsSchema)
<span class="code-keyword">async def</span> <span class="code-func">get_telemetry_metrics</span>(
    tenant: Tenant = <span class="code-func">Depends</span>(verify_token_bucket),
    db: AsyncSession = <span class="code-func">Depends</span>(get_async_db),
    redis: Redis = <span class="code-func">Depends</span>(get_redis_pool)
):
    cache_key = <span class="code-str">f"metrics:tenant:{tenant.id}"</span>
    
    <span class="code-comment"># Multi-tier cache-aside check with selective TTL</span>
    cached_payload = <span class="code-keyword">await</span> redis.get(cache_key)
    <span class="code-keyword">if</span> cached_payload:
        <span class="code-keyword">return</span> orjson.loads(cached_payload)

    <span class="code-comment"># Non-blocking async connection-pooled Postgres query</span>
    stmt = select(ServiceRecord).where(ServiceRecord.active == <span class="code-keyword">True</span>)
    records = <span class="code-keyword">await</span> db.execute(stmt)
    telemetry = <span class="code-keyword">await</span> aggregate_p95_latency(records.scalars().all())
    
    <span class="code-comment"># Cache response with 300s TTL</span>
    <span class="code-keyword">await</span> redis.setex(cache_key, <span class="code-num">300</span>, orjson.dumps(telemetry))
    <span class="code-keyword">return</span> telemetry`,
    telemetry: `
      <div>
        <div class="telemetry-header">
          <span>Production Telemetry</span>
          <span class="status-dot"></span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Connection Pool:</span>
          <span class="telemetry-val highlight">24 active / 50 pool</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Redis Cache Hit Ratio:</span>
          <span class="telemetry-val success">94.2% hit rate</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">p95 Latency:</span>
          <span class="telemetry-val success" id="p95Val">24.8ms (-86%)</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">DB Query Load:</span>
          <span class="telemetry-val highlight">-60% reduced</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Active Endpoints:</span>
          <span class="telemetry-val">30+ Async REST APIs</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">CI/CD Test Coverage:</span>
          <span class="telemetry-val success">92% (pytest-asyncio)</span>
        </div>
      </div>
      <div class="telemetry-interactive-action">
        <span style="font-size: 12px; color: #94a3b8;">Simulate Live Request</span>
        <button type="button" class="button-ghost-dark" onclick="simulateFastApiRequest()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Send GET /metrics
        </button>
      </div>
    `
  },

  nginz: {
    title: 'NginZ Cloud API Gateway • Service Coordinator',
    status: '1,000 RPS Sustained • 0% Errors',
    statusDot: 'dot-green',
    code: `<span class="code-comment">// NginZ: Distributed Gateway Token Bucket & Circuit Breaker</span>
<span class="code-keyword">import</span> { Request, Response, NextFunction } <span class="code-keyword">from</span> <span class="code-str">'express'</span>;
<span class="code-keyword">import</span> { redisClient } <span class="code-keyword">from</span> <span class="code-str">'./redisCoordinator'</span>;
<span class="code-keyword">import</span> { CircuitBreaker } <span class="code-keyword">from</span> <span class="code-str">'./circuitBreaker'</span>;

<span class="code-keyword">const</span> breaker = <span class="code-keyword">new</span> CircuitBreaker({
  failureThreshold: <span class="code-num">5</span>,
  cooldownPeriodMs: <span class="code-num">3000</span>,
  fallbackStrategy: <span class="code-str">'local-jwt-cache'</span>
});

<span class="code-keyword">export async function</span> <span class="code-func">rateLimitAndRoute</span>(req: Request, res: Response, next: NextFunction) {
  <span class="code-keyword">const</span> clientKey = <span class="code-str">\`rate:\${req.ip}:\${req.headers['x-service-id']}\`</span>;
  
  <span class="code-comment">// Atomic Token Bucket calculation via Redis Lua</span>
  <span class="code-keyword">const</span> [tokensLeft, resetAfter] = <span class="code-keyword">await</span> redisClient.eval(
    TOKEN_BUCKET_LUA_SCRIPT, <span class="code-num">1</span>, clientKey, <span class="code-num">1000</span>, <span class="code-num">100</span>, Date.now()
  );

  <span class="code-keyword">if</span> (tokensLeft &lt; <span class="code-num">0</span>) {
    <span class="code-keyword">return</span> res.status(<span class="code-num">429</span>).json({ error: <span class="code-str">'TooManyRequests'</span>, retryAfter: resetAfter });
  }

  <span class="code-keyword">return</span> breaker.execute(() =&gt; next());
}`,
    telemetry: `
      <div>
        <div class="telemetry-header">
          <span>Gateway Coordinator</span>
          <span class="status-dot"></span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Dockerized Instances:</span>
          <span class="telemetry-val highlight">10 Instances</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Sustained Throughput:</span>
          <span class="telemetry-val success" id="gatewayRps">1,000 RPS</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Circuit Breakers:</span>
          <span class="telemetry-val success">10/10 CLOSED (Healthy)</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Central Auth Failover:</span>
          <span class="telemetry-val highlight">0ms (Local JWT)</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Telemetry Metrics:</span>
          <span class="telemetry-val">5 Live Grafana Dashboards</span>
        </div>
      </div>
      <div class="telemetry-interactive-action">
        <span style="font-size: 12px; color: #94a3b8;">Simulate Traffic Spike</span>
        <button type="button" class="button-ghost-dark" onclick="simulateGatewaySpike()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Inject +500 RPS Spike
        </button>
      </div>
    `
  },

  rag: {
    title: 'ChromaDB Vector Infrastructure • Lyceum Development Centre',
    status: '5M+ Vectors • MMR Retrieval',
    statusDot: 'dot-green',
    code: `<span class="code-comment"># Lyceum Development: 5M+ ChromaDB Vector Indexing & RAG</span>
<span class="code-keyword">from</span> langchain.vectorstores <span class="code-keyword">import</span> Chroma
<span class="code-keyword">from</span> langchain.embeddings <span class="code-keyword">import</span> HuggingFaceEmbeddings
<span class="code-keyword">from</span> langchain.chains <span class="code-keyword">import</span> RetrievalQA
<span class="code-keyword">import</span> chromadb

client = chromadb.HttpClient(host=<span class="code-str">"vector-cluster.internal"</span>, port=<span class="code-num">8000</span>)
embeddings = HuggingFaceEmbeddings(model_name=<span class="code-str">"sentence-transformers/all-MiniLM-L6-v2"</span>)

vector_db = Chroma(
    client=client,
    collection_name=<span class="code-str">"enterprise_rfp_knowledge_base"</span>,
    embedding_function=embeddings
)

<span class="code-comment"># MMR (Maximal Marginal Relevance) balances relevance & novelty</span>
retriever = vector_db.as_retriever(
    search_type=<span class="code-str">"mmr"</span>,
    search_kwargs={<span class="code-str">"k"</span>: <span class="code-num">5</span>, <span class="code-str">"fetch_k"</span>: <span class="code-num">25</span>, <span class="code-str">"lambda_mult"</span>: <span class="code-num">0.7</span>}
)

qa_system = RetrievalQA.from_chain_type(
    llm=llm_engine,
    chain_type=<span class="code-str">"stuff"</span>,
    retriever=retriever,
    return_source_documents=<span class="code-keyword">True</span>
)`,
    telemetry: `
      <div>
        <div class="telemetry-header">
          <span>Vector Database Metrics</span>
          <span class="status-dot"></span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Indexed Embeddings:</span>
          <span class="telemetry-val highlight">5,214,800 Vectors</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Monthly Document ETL:</span>
          <span class="telemetry-val">300+ Enterprise RFPs</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Retrieval Latency:</span>
          <span class="telemetry-val success">&lt; 3.0s (6x Faster)</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Retrieval Precision:</span>
          <span class="telemetry-val success">95% on 1,800 QA Pairs</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Client Turnaround:</span>
          <span class="telemetry-val highlight">30 mins (was 3 hrs)</span>
        </div>
      </div>
      <div class="telemetry-interactive-action">
        <span style="font-size: 12px; color: #94a3b8;">Simulate Vector Query</span>
        <button type="button" class="button-ghost-dark" onclick="simulateRagQuery()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Execute Semantic Search
        </button>
      </div>
    `
  },

  sisa: {
    title: 'Machine Unlearning using SISA Training (MUnL)',
    status: '90% Compute Cut • 95%+ Retained Acc',
    statusDot: 'dot-green',
    code: `<span class="code-comment"># PyTorch SISA: Sharded Isolated Sliced Aggregated Machine Unlearning</span>
<span class="code-keyword">import</span> torch
<span class="code-keyword">from</span> sisa_pipeline <span class="code-keyword">import</span> ShardSliceManager

<span class="code-keyword">class</span> <span class="code-func">SISAUnlearningCoordinator</span>:
    <span class="code-keyword">def</span> <span class="code-func">__init__</span>(self, num_shards=<span class="code-num">5</span>, num_slices=<span class="code-num">4</span>):
        self.manager = ShardSliceManager(shards=num_shards, slices=num_slices)
        
    <span class="code-keyword">async def</span> <span class="code-func">process_deletion_request</span>(self, user_id: str):
        shard_idx, slice_idx = self.manager.locate_sample(user_id)
        
        <span class="code-comment"># Only reload slice checkpoint prior to point of deletion</span>
        base_checkpoint = self.manager.get_checkpoint(shard_idx, slice_idx - <span class="code-num">1</span>)
        clean_slice_data = self.manager.filter_out(shard_idx, slice_idx, user_id)
        
        <span class="code-comment"># Retrain isolated slice only: 80% time savings</span>
        updated_slice = <span class="code-keyword">await</span> self.manager.retrain_slice(base_checkpoint, clean_slice_data)
        self.manager.save_checkpoint(shard_idx, slice_idx, updated_slice)
        
        <span class="code-comment"># Re-aggregate ensemble weights with zero whole-model retrain</span>
        <span class="code-keyword">return</span> self.manager.aggregate_ensemble()`,
    telemetry: `
      <div>
        <div class="telemetry-header">
          <span>Unlearning Benchmark</span>
          <span class="status-dot"></span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Compute Cost Slash:</span>
          <span class="telemetry-val highlight">-90% Compute Cost</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Retraining Speedup:</span>
          <span class="telemetry-val success">80% Faster Retrain</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Retained Accuracy:</span>
          <span class="telemetry-val success">95.4% Model Accuracy</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Dataset:</span>
          <span class="telemetry-val">FNMA Mortgage Loan Data</span>
        </div>
        <div class="telemetry-row">
          <span class="telemetry-label">Verification Dashboard:</span>
          <span class="telemetry-val">Interactive Streamlit UI</span>
        </div>
      </div>
      <div class="telemetry-interactive-action">
        <span style="font-size: 12px; color: #94a3b8;">Simulate Deletion Request</span>
        <button type="button" class="button-ghost-dark" onclick="simulateUnlearning()">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          Unlearn User Record
        </button>
      </div>
    `
  }
};

function initConsoleTabs() {
  const tabs = document.querySelectorAll('.console-tab');
  if (!tabs || tabs.length === 0) return;
  const titleBadge = document.getElementById('consoleActiveTitle');
  const pingStatus = document.getElementById('consolePingStatus');
  const codePane = document.getElementById('consoleCodeDisplay');
  const telemetryPane = document.getElementById('consoleTelemetryDisplay');

  function renderTab(key) {
    const data = consoleData[key];
    if (!data) return;

    if (titleBadge) titleBadge.textContent = data.title;
    if (pingStatus) pingStatus.textContent = data.status;
    if (codePane) codePane.innerHTML = `<pre><code>${data.code}</code></pre>`;
    if (telemetryPane) telemetryPane.innerHTML = data.telemetry;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabKey = tab.getAttribute('data-tab');
      renderTab(tabKey);
    });
  });

  // Initial render
  renderTab('fastapi');
}

// Global simulation helper functions
window.simulateFastApiRequest = function() {
  const p95El = document.getElementById('p95Val');
  const pingEl = document.getElementById('consolePingStatus');
  if (p95El) {
    const randomLatency = (22 + Math.random() * 4).toFixed(1);
    p95El.textContent = `${randomLatency}ms (Redis HIT)`;
    p95El.style.color = '#38bdf8';
    if (pingEl) pingEl.textContent = `200 OK • ${randomLatency}ms`;
    setTimeout(() => {
      p95El.textContent = '24.8ms (-86%)';
      p95El.style.color = '#34d399';
      if (pingEl) pingEl.textContent = '200 OK • 24.8ms';
    }, 2000);
  }
};

window.simulateGatewaySpike = function() {
  const rpsEl = document.getElementById('gatewayRps');
  if (rpsEl) {
    rpsEl.textContent = '1,500 RPS (Rate Limited)';
    rpsEl.style.color = '#fbbf24';
    setTimeout(() => {
      rpsEl.textContent = '1,000 RPS';
      rpsEl.style.color = '#34d399';
    }, 2500);
  }
};

window.simulateRagQuery = function() {
  const pingEl = document.getElementById('consolePingStatus');
  if (pingEl) {
    pingEl.textContent = 'MMR Scanning 5M Vectors...';
    setTimeout(() => {
      pingEl.textContent = 'Top-5 Retrieved in 2.1s (95% Sim)';
      setTimeout(() => {
        pingEl.textContent = '5M+ Vectors • MMR Retrieval';
      }, 2500);
    }, 700);
  }
};

window.simulateUnlearning = function() {
  const pingEl = document.getElementById('consolePingStatus');
  if (pingEl) {
    pingEl.textContent = 'Slice 2 Retrained (0.38s)';
    setTimeout(() => {
      pingEl.textContent = 'Weights Aggregated • 95.4% Acc';
      setTimeout(() => {
        pingEl.textContent = '90% Compute Cut • 95%+ Retained Acc';
      }, 2500);
    }, 800);
  }
};

/* ==========================================================================
   2. PROJECT CATEGORY FILTERING
   ========================================================================== */
function initProjectFiltering() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          card.style.transform = 'translateY(8px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   3. RESUME & CV MODAL
   ========================================================================== */
function initResumeModal() {
  const modal = document.getElementById('resumeModal');
  const openBtn = document.getElementById('openResumeModalBtn');
  const closeBtn = document.getElementById('closeResumeModalBtn');
  const creamBtn = document.getElementById('creamViewResumeBtn');
  const pdfFrame = document.getElementById('pdfPreviewFrame');

  function openModal() {
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (creamBtn) creamBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  window.loadPdfPreview = function(pdfUrl) {
    if (pdfFrame) {
      pdfFrame.src = pdfUrl;
    }
  };
}

/* ==========================================================================
   4. SCROLL EFFECTS & NAVBAR SPY
   ========================================================================== */
function initScrollEffects() {
  const header = document.getElementById('siteHeader');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    // Sticky header shadow & blur
    if (header) {
      if (scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Nav link active state spy
    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    if (currentSection) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }
  }, { passive: true });
}

/* ==========================================================================
   5. MOBILE MENU TOGGLE
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggleBtn');
  const navLinksList = document.getElementById('navLinksList');

  if (toggleBtn && navLinksList) {
    toggleBtn.addEventListener('click', () => {
      navLinksList.classList.toggle('mobile-open');
    });

    // Close on link click
    navLinksList.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksList.classList.remove('mobile-open');
      });
    });
  }
}
