// ========================================
// CYBERPUNK PORTFOLIO - JAVASCRIPT
// Version: 1.0.0
// ========================================

"use strict";

// ========================================
// PHOTO GALLERY CONFIGURATION
// To add a new photo: add one entry to PHOTO_GALLERY.
//   file  — filename inside pictures/
//   label — caption shown on hover
//   size  — (optional) 'large' | 'wide' | 'tall' | '' (default square)
//            Omit size to let the auto-cycle assign one for variety.
// ========================================

const PHOTO_GALLERY = [
  { file: "p1.jpg",  label: "Sea Fishing" },
  { file: "p4.JPG",  label: "Happy Graduate!", size: "large" },
  { file: "p2.JPG",  label: "Ocean" },
  { file: "p3.JPG",  label: "yxp!",            size: "wide" },
  { file: "p5.JPG",  label: "zjh!",            size: "large" },
  { file: "p6.JPG",  label: "Bye UVA",         size: "tall" },
  { file: "p8.JPG",  label: "Bros" },
  { file: "p7.JPG",  label: "Fam",             size: "large" },
  { file: "p10.JPG", label: "ckc" },
  { file: "p9.JPG",  label: "Bros",            size: "wide" },
  { file: "p11.JPG", label: "yxp!" },
  { file: "p12.JPG", label: "Hi Boston" },
  { file: "p13.JPG", label: "Yosemite with YXP" },
  { file: "p14.JPG", label: "Yosemite Trail",    size: "wide" },
  { file: "p15.JPG", label: "Waterfall",          size: "tall" },
];

// ========================================
// TRANSLATIONS (i18n)
// To add a language: add a new key matching a 2-letter lang code.
// ========================================

const TRANSLATIONS = {
  en: {
    // Nav
    'nav-overview':    '01 // OVERVIEW',
    'nav-experience':  '02 // EXPERIENCE',
    'nav-projects':    '03 // PROJECTS',
    'nav-me':          '04 // ME',
    'nav-timeline':    '05 // TIMELINE',
    'nav-visual':      '06 // VISUAL',
    // Section titles
    'section-professional': 'PROFESSIONAL_EXPERIENCES',
    'section-projects':     'PROJECT_DATABASE',
    'section-biography':    'BIOGRAPHY_DATA',
    'section-timeline':     'LOG_HISTORY',
    'section-gallery':      'VISUAL_DATABASE',
    // Entry
    'entry-description': 'Engineer // LLM // Data // Development',
    'cta-text': 'READ_ME',
    // Professional
    'subsection-internship': "{'INTERNSHIP'}",
    'subsection-skills':     "{'SKILL_MATRIX'}",
    'exp1-desc': 'Built automated ETL pipelines processing 1000+ US/HK/CN stock filings: HTML\u2192PDF\u2192TOC\u2192section embeddings\u2192summary, enabling real-time investment insights; supported both daily scheduled runs and per-stock queries.',
    'exp2-desc': 'Research on Individual + Team level predictors of project/course grades under Project-Based Learning Courses setting.',
    'exp3-desc': 'Selected for a student career program featuring a team-based project competition to design and implement a company logging system from scratch, covering requirements elicitation, system design, development, beta testing, and final presentation.',
    'skill-languages': 'Languages',
    'skill-data-ml':   'Data & ML Systems',
    'skill-infra':     'Data & Infra',
    'skill-ai':        'Machine Learning / AI',
    'skill-backend':   'Backend & Tools',
    // Projects (innerHTML for ul.project-desc-list)
    'project-news':      '<li>Personalized news discovery system that aggregates articles from 8+ sources (EventRegistry, Tavily, arXiv, Hacker News, GitHub Trending), scores them against evolving user interest profiles, and delivers a curated HTML digest via email at every macOS login \u2014 zero manual steps.</li><li>Built a multi-stage processing pipeline: normalize \u2192 deduplicate \u2192 classify \u2192 two-level LLM summarization (Groq Llama 3.3 70B); idempotent delivery enforced at the database level ensures exactly one email per day regardless of how many times the machine boots.</li><li>Implemented a behavioral feedback loop via a Cloudflare Worker click-tracking relay: every article link in the email redirects through the worker, logs the click to KV storage, then redirects to the real URL; domain interest weights auto-adjust on the next boot.</li><li>Designed an async FastAPI backend with SQLAlchemy + PostgreSQL + Redis, containerized with Docker Compose; the server boots, delivers, and shuts itself down cleanly \u2014 no persistent background processes.</li>',
    'project-trader':    '<li>AI-powered stock consultant running a 7-stage discovery funnel (macro regime detection \u2192 sector ETF scoring \u2192 S&amp;P 500 universe \u2192 hard filters \u2192 quant pre-score \u2192 LLM fundamental review \u2192 top 10) to surface actionable candidates without needing a ticker.</li><li>Built a 6-layer quantitative scoring engine (trend, momentum, volatility, volume, mean-reversion, aggregate) with regime-adaptive weights; 20 thresholds externalized and calibrated via differential evolution with overfit guards (validation IC must be \u226550% of training IC).</li><li>Implemented a two-tier Monte Carlo simulation: GARCH(1,1)+Student-t for volatility clustering and fat tails when \u226560 days of data available, with GBM+EWMA fallback; earnings days within the forecast horizon receive inflated volatility.</li><li>Validated with a no-lookahead walk-forward backtesting engine across 25 diverse scenarios (379 tests total); generates full HTML reports covering position sizing, stop-loss, and sector-normalized signal output.</li>',
    'project-ecommerce': '<li>Analyzed 1.3M+ user records from reviews, transactions, and marketing campaigns in an e-commerce environment. Delivered actionable insights linking text sentiment, engagement behavior, and conversion outcomes.</li><li>Preprocessed and engineered features from large-scale structured and unstructured data (310K+ transactions, 560K+ reviews) using PySpark+Pandas for distributed data cleaning, EDA, and feature preprocessing.</li><li>Applied NLP techniques (tokenization, N-Gram, TF-IDF vectorization) to extract product sentiment and reviewer satisfaction; trained Logistic Regression and Random Forest classifiers achieving AUC = 0.96.</li><li>Built conversion rate prediction models with feature importance visualization to identify top-performing customer segments, boosting model performance from AUC = 0.84 \u2192 0.93.</li><li>Analyzed an A/B email experiment (480K users, 24 groups) using statistical hypothesis testing and time series analysis, revealing optimal campaign frequency and increasing open rate by 55%.</li>',
    'project-emotion':   '<li>Built a real-time emotion recognition application integrating OpenCV for face detection and PyTorch for deep neural network model.</li><li>Fine-tuned a ResNet-169 pretrained on ImageNet by unfreezing final convolutional and fully connected layers; applied data augmentation, batch normalization, dropout, and cross-entropy loss optimization.</li><li>Designed a custom dual-branch CNN (MultiScale EmotionCNN) combining 48\u00d748 and 24\u00d724 feature paths with adaptive pooling and fusion (2880-dim vector) for multi-scale facial feature extraction, achieving 65% test accuracy.</li><li>Achieved ~70% classification accuracy across 6 emotion classes (with fine-tuned ResNet-169); deployed a live webcam demo performing real-time face detection, tensor transformation, and emotion label overlay.</li>',
    'project-cville':    '<li>Engineered a travel review platform leveraging Python/Django (MVC architecture) and integrated Google Maps API for dynamic, location-based service rendering.</li><li>Implemented secure user authentication via the Google Login API and designed a role-based authorization system (Admin/Regular User) to enhance data security and management efficiency.</li><li>Developed a Travel Recommendation Algorithm that utilizes user preferences and available time constraints to generate optimized schedules via a custom distance-calculation and review score ranking algorithm.</li><li>Conducted unit, system, and GUI testing with Selenium; gathered user feedback during a beta testing phase and iterated based on results.</li>',
    // Biography
    'about-p1': 'Currently pursuing a Data Science Master Degree, seeking to leverage Python, SQL, and advanced analytics to drive data-informed business decisions, with a strong foundational knowledge in Computer Science, Statistics, and Data Science.',
    'about-p2': "I build systems that actually run in production \u2014 data pipelines processing thousands of financial filings, recommendation engines that adapt from user feedback, and AI agents that deliver real output on a schedule. My work sits at the intersection of machine learning, data engineering, and systems design; I care about the whole stack, from raw data ingestion to the final user-facing output. Outside the terminal, you'll find me on the tennis court, at the gym, or deep in a book.",
    'highlight-1': 'Detail-oriented perfectionist',
    'highlight-2': 'Faster Learner',
    'highlight-3': 'Innovation enthusiast',
    'edu-uva-desc':   'Specialized in Machine Learning, Algorithm, Data Analysis',
    'edu-ucla-desc':  'Focus on Advanced/Large-scale machine learning, deep learning, and distributed systems',
    'interest-cyber': 'Cybersecurity',
    'interest-ai-ml': 'AI/ML Integration',
    'interest-dl':    'Deep Learning',
    'interest-perf':  'Performance Optimization',
    'interest-db':    'Database',
    // Timeline
    'timeline-researcher': 'Research Assistant - Computer Science Department',
    'timeline-fullstack':  'Full-stack Developer Internship',
    'timeline-de':         'Data Engineer Internship',
    'timeline-future':     'Everything is possible! Stay positive and keep learning!',
    // Footer
    'footer-greeting': 'Nice to meet you!',
    'status-text':     'ALL SYSTEMS OPERATIONAL',
  },

  zh: {
    // Nav
    'nav-overview':    '01 // 概述',
    'nav-experience':  '02 // 经历',
    'nav-projects':    '03 // 项目',
    'nav-me':          '04 // 关于我',
    'nav-timeline':    '05 // 时间线',
    'nav-visual':      '06 // 相册',
    // Section titles
    'section-professional': '专业经历',
    'section-projects':     '项目库',
    'section-biography':    '个人简介',
    'section-timeline':     '成长轨迹',
    'section-gallery':      '相册',
    // Entry
    'entry-description': '工程师 // 大语言模型 // 数据 // 开发',
    'cta-text': '了解更多',
    // Professional
    'subsection-internship': "{'实习经历'}",
    'subsection-skills':     "{'技能矩阵'}",
    'exp1-desc': '构建自动化ETL数据管道，处理超过1000家美港中上市公司的财报文件：HTML\u2192PDF\u2192目录\u2192章节嵌入\u2192摘要，实现实时投资洞察；支持每日定时运行和按股票查询两种模式。',
    'exp2-desc': '在项目式学习课程背景下，研究个人及团队层面的预测因素对项目/课程成绩的影响。',
    'exp3-desc': '入选学生职业发展项目，以团队形式参与企业日志系统的全流程设计与实现，涵盖需求分析、系统设计、开发、测试及最终汇报。',
    'skill-languages': '编程语言',
    'skill-data-ml':   '数据与机器学习系统',
    'skill-infra':     '数据与基础设施',
    'skill-ai':        '机器学习 / 人工智能',
    'skill-backend':   '后端与工具',
    // Projects (innerHTML)
    'project-news':      '<li>个性化新闻发现系统，从8+数据源（EventRegistry、Tavily、arXiv、Hacker News、GitHub Trending）聚合文章，按演化的用户兴趣档案评分，并在每次macOS登录时通过邮件发送精选HTML摘要——全程无需人工操作。</li><li>构建了多阶段处理流水线：标准化\u2192去重\u2192分类\u2192两级LLM摘要（Groq Llama 3.3 70B）；在数据库层面强制幂等投递，无论机器启动多少次，确保每天恰好发送一封邮件。</li><li>通过Cloudflare Worker点击追踪中继实现了行为反馈闭环：邮件中的每个文章链接先经过Worker重定向、将点击记录到KV存储，再跳转到真实URL；领域兴趣权重在下次启动时自动调整。</li><li>设计了基于FastAPI的异步后端（SQLAlchemy + PostgreSQL + Redis），通过Docker Compose容器化；服务器启动、投递完毕后自动关闭——无任何持久后台进程。</li>',
    'project-trader':    '<li>AI驱动的股票顾问，运行7阶段发现漏斗（宏观市场状态检测\u2192行业ETF评分\u2192S&amp;P 500全集\u2192硬性过滤\u2192量化预评分\u2192LLM基本面审查\u2192Top 10），无需指定股票代码即可推荐可操作候选标的。</li><li>构建了6层量化评分引擎（趋势、动量、波动率、成交量、均值回归、综合），配合市场状态自适应权重；20个阈值外化配置，通过差分进化算法校准，并设有过拟合防护（验证集IC须≥训练集IC的50%）。</li><li>实现了两层蒙特卡洛模拟：当历史数据≥60天时采用GARCH(1,1)+Student-t分布以捕捉波动率聚类和厚尾特性，否则回退到GBM+EWMA方案；预测期内的财报日会触发波动率放大。</li><li>通过无前视偏差的滚动前向回测框架，在25个多样化场景（共379次测试）中完成验证；生成包含仓位规模、止损策略及行业标准化信号输出的完整HTML报告。</li>',
    'project-ecommerce': '<li>分析电商环境中130万+用户记录，涵盖评论、交易及营销活动数据，挖掘文本情感、用户行为与转化结果之间的关联，提供可操作的业务洞察。</li><li>使用PySpark+Pandas对大规模结构化与非结构化数据（31万+交易、56万+评论）进行分布式数据清洗、探索性分析和特征预处理。</li><li>应用NLP技术（分词、N-Gram、TF-IDF向量化）提取产品情感与用户满意度；训练逻辑回归和随机森林分类器，AUC达0.96。</li><li>构建转化率预测模型并进行特征重要性可视化，识别高价值客户群体，将模型性能从AUC=0.84提升至0.93。</li><li>对48万用户、24组A/B邮件实验进行统计假设检验和时间序列分析，揭示最优营销频率，邮件打开率提升55%。</li>',
    'project-emotion':   '<li>构建实时情绪识别应用，集成OpenCV人脸检测与PyTorch深度神经网络模型。</li><li>在ImageNet预训练的ResNet-169上进行微调，解冻最后卷积层和全连接层；应用数据增强、批归一化、Dropout及交叉熵损失优化。</li><li>设计自定义双分支CNN（MultiScale EmotionCNN），融合48\u00d748和24\u00d724特征路径，使用自适应池化与特征融合（2880维向量），实现多尺度人脸特征提取，测试准确率达65%。</li><li>微调后的ResNet-169在6种情绪分类上达到约70%准确率；部署实时摄像头Demo，实现人脸检测、张量变换和情绪标签叠加的实时推理。</li>',
    'project-cville':    '<li>基于Python/Django（MVC架构）构建旅游评价平台，集成Google Maps API实现动态地理位置服务渲染。</li><li>通过Google Login API实现安全用户认证，设计基于角色的权限系统（管理员/普通用户），提升数据安全性与管理效率。</li><li>开发旅游推荐算法，根据用户偏好和可用时间生成优化行程，采用自定义距离计算和评分排名算法。</li><li>使用Selenium进行单元测试、系统测试和GUI测试；收集Beta测试用户反馈并迭代优化。</li>',
    // Biography
    'about-p1': '目前正在攻读数据科学硕士学位，致力于将Python、SQL及高级分析技术应用于数据驱动的商业决策，具备计算机科学、统计学与数据科学的扎实基础。',
    'about-p2': '我构建真正运行于生产环境的系统——数据管道处理数千份金融报告、根据用户反馈自适应的推荐引擎、以及按计划交付实际输出的AI智能体。我的工作横跨机器学习、数据工程与系统设计的交汇处；我关注完整的技术栈，从原始数据接入到最终面向用户的产品。工作之外，你会在网球场、健身房或书海中找到我。',
    'highlight-1': '注重细节的完美主义者',
    'highlight-2': '快速学习者',
    'highlight-3': '技术创新爱好者',
    'edu-uva-desc':   '专注于机器学习、算法及数据分析',
    'edu-ucla-desc':  '专注于高级/大规模机器学习、深度学习及分布式系统',
    'interest-cyber': '网络安全',
    'interest-ai-ml': 'AI/ML 整合',
    'interest-dl':    '深度学习',
    'interest-perf':  '性能优化',
    'interest-db':    '数据库',
    // Timeline
    'timeline-researcher': '研究助理 \u2014 计算机科学系',
    'timeline-fullstack':  '全栈开发实习',
    'timeline-de':         '数据工程师实习',
    'timeline-future':     '一切皆有可能！保持积极，持续学习！',
    // Footer
    'footer-greeting': '很高兴认识你！',
    'status-text':     '所有系统运行正常',
  },
};

// ========================================
// PARTICLE ANIMATION (Entry Section)
// ========================================

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.particleCount = 150;
    this.connectionDistance = 120;

    this.resize();
    this.init();

    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw particles
    this.particles.forEach((particle, i) => {
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary check
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = "rgba(0, 243, 255, 0.8)";
      this.ctx.fill();

      // Draw connections
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[j].x - particle.x;
        const dy = this.particles[j].y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          const opacity = (1 - distance / this.connectionDistance) * 0.5;
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// SMOOTH SCROLLING
// ========================================

function initSmoothScroll() {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const navHeight = document.querySelector(".nav-bar").offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });

        // Close mobile menu if open
        const navMenu = document.querySelector(".nav-menu");
        if (navMenu.classList.contains("active")) {
          navMenu.classList.remove("active");
        }
      }
    });
  });

  // CTA button smooth scroll
  const ctaButton = document.querySelector(".cta-button");
  if (ctaButton) {
    ctaButton.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = ctaButton.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const navHeight = document.querySelector(".nav-bar").offsetHeight;
        const targetPosition = targetSection.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  }
}

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

function initMobileNav() {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }
}

// ========================================
// EXPERIENCE CARDS EXPANSION
// ========================================

function initExperienceCards() {
  const cards = document.querySelectorAll(".experience-card");

  cards.forEach((card) => {
    const content = card.querySelector(".card-content");
    const expandBtn = card.querySelector(".card-expand");
    let isExpanded = false;

    // Set initial max-height
    content.style.maxHeight = "150px";
    content.style.overflow = "hidden";
    content.style.transition = "max-height 0.3s ease";

    card.addEventListener("click", () => {
      if (!isExpanded) {
        content.style.maxHeight = content.scrollHeight + "px";
        expandBtn.style.transform = "rotate(45deg)";
        isExpanded = true;
      } else {
        content.style.maxHeight = "150px";
        expandBtn.style.transform = "rotate(0deg)";
        isExpanded = false;
      }
    });
  });
}

// ========================================
// SKILL BARS ANIMATION ON SCROLL
// ========================================

function initSkillBarsAnimation() {
  const skillItems = document.querySelectorAll(".skill-item");

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const progressBar = entry.target.querySelector(".skill-progress");
        const width = progressBar.style.width;

        // Reset and animate
        progressBar.style.width = "0";
        setTimeout(() => {
          progressBar.style.width = width;
        }, 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  skillItems.forEach((item) => observer.observe(item));
}

// ========================================
// TIMELINE ANIMATION ON SCROLL
// ========================================

function initTimelineAnimation() {
  const timelineItems = document.querySelectorAll(".timeline-item");

  const observerOptions = {
    threshold: 0.3,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }, index * 100);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  timelineItems.forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(20px)";
    item.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(item);
  });
}

// ========================================
// PHOTO WALL BUILDER
// ========================================

function initPhotoWall() {
  const photoWall = document.querySelector(".photo-wall");
  if (!photoWall) return;

  // Sizes auto-assigned to entries that don't specify one.
  // Cycle ensures visual variety without clustering identical sizes.
  const AUTO_SIZES = ["", "large", "", "wide", "", "", "tall", ""];

  PHOTO_GALLERY.forEach((photo, index) => {
    const size =
      photo.size !== undefined ? photo.size : AUTO_SIZES[index % AUTO_SIZES.length];
    const delay = ((index + 1) * 0.1).toFixed(1);
    const memNum = String(index + 1).padStart(2, "0");

    const div = document.createElement("div");
    div.className = "photo-item" + (size ? " " + size : "");
    div.dataset.tilt = "";
    div.style.setProperty("--delay", delay + "s");

    div.innerHTML =
      '<img src="pictures/' + photo.file + '" alt="Memory ' + memNum + '" loading="lazy">' +
      '<div class="photo-overlay"><span class="photo-label">' + photo.label + "</span></div>";

    photoWall.appendChild(div);
  });
}

// ========================================
// 3D TILT EFFECT FOR PHOTO WALL
// ========================================

class TiltEffect {
  constructor(element) {
    this.element = element;
    this.settings = {
      maxTilt: 15,
      perspective: 1000,
      scale: 1.05,
      speed: 400,
      easing: "cubic-bezier(.03,.98,.52,.99)",
    };

    this.init();
  }

  init() {
    this.element.style.transformStyle = "preserve-3d";
    this.element.style.transition = `transform ${this.settings.speed}ms ${this.settings.easing}`;

    this.element.addEventListener("mouseenter", () => this.onMouseEnter());
    this.element.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.element.addEventListener("mouseleave", () => this.onMouseLeave());
  }

  onMouseEnter() {
    this.element.style.willChange = "transform";
    this.element.dataset.tilting = "1";
  }

  onMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    const tiltX = percentY * this.settings.maxTilt;
    const tiltY = -percentX * this.settings.maxTilt;

    this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})
        `;
  }

  onMouseLeave() {
    this.element.style.willChange = "auto";
    this.element.dataset.tilting = "0";
    this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale3d(1, 1, 1)
        `;
  }
}

function initPhotoTilt() {
  const photoItems = document.querySelectorAll("[data-tilt]");
  photoItems.forEach((item) => new TiltEffect(item));
}

// ========================================
// PARALLAX EFFECT FOR PHOTO WALL
// ========================================

function initPhotoParallax() {
  const photoWall = document.querySelector(".photo-wall");
  if (!photoWall) return;

  const gallerySection = document.querySelector(".gallery-section");
  if (!gallerySection) return;

  const handler = throttle(() => {
    const photoItems = photoWall.querySelectorAll(".photo-item");
    const scrolled = window.pageYOffset;
    const galleryTop = gallerySection.offsetTop;
    const galleryHeight = gallerySection.offsetHeight;

    if (
      scrolled > galleryTop - window.innerHeight &&
      scrolled < galleryTop + galleryHeight
    ) {
      photoItems.forEach((item, index) => {
        // Skip items currently under the tilt effect — avoid transform conflicts
        if (item.dataset.tilting === "1") return;
        const speed = ((index % 3) + 1) * 0.05;
        const yPos = (scrolled - galleryTop) * speed;
        item.style.transform = `translateY(${yPos}px)`;
      });
    }
  }, 16);

  window.addEventListener("scroll", handler);
}

// ========================================
// NAVBAR BACKGROUND ON SCROLL
// ========================================

function initNavbarScroll() {
  const navbar = document.querySelector(".nav-bar");

  const handler = throttle(() => {
    if (window.scrollY > 100) {
      navbar.style.background = "rgba(10, 10, 15, 0.95)";
      navbar.style.boxShadow = "0 5px 20px rgba(0, 243, 255, 0.2)";
    } else {
      navbar.style.background = "rgba(10, 10, 15, 0.9)";
      navbar.style.boxShadow = "none";
    }
  }, 100);

  window.addEventListener("scroll", handler);
}

// ========================================
// SECTION FADE IN ON SCROLL
// ========================================

function initSectionFadeIn() {
  const sections = document.querySelectorAll(".section");

  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "opacity 0.8s ease, transform 0.8s ease";
    observer.observe(section);
  });
}

// ========================================
// CURSOR TRAIL EFFECT (Optional Enhancement)
// ========================================

class CursorTrail {
  constructor() {
    this.coords = [];
    this.maxCoords = 20;

    this.canvas = document.createElement("canvas");
    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "9999";
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.resize();

    window.addEventListener("resize", () => this.resize());
    window.addEventListener("mousemove", (e) => this.addCoord(e));

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  addCoord(e) {
    this.coords.push({ x: e.clientX, y: e.clientY });
    if (this.coords.length > this.maxCoords) {
      this.coords.shift();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.coords.forEach((coord, index) => {
      const nextCoord = this.coords[index + 1] || this.coords[index];

      this.ctx.beginPath();
      this.ctx.moveTo(coord.x, coord.y);
      this.ctx.lineTo(nextCoord.x, nextCoord.y);

      const opacity = index / this.coords.length;
      this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.3})`;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw dot
      this.ctx.beginPath();
      this.ctx.arc(coord.x, coord.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 243, 255, ${opacity * 0.5})`;
      this.ctx.fill();
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ========================================
// GLITCH TEXT EFFECT
// ========================================

function initGlitchEffect() {
  const glitchElements = document.querySelectorAll(".glitch");

  glitchElements.forEach((element) => {
    const text = element.getAttribute("data-text");

    setInterval(() => {
      if (Math.random() > 0.95) {
        element.style.textShadow = `
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #ff00ff,
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #00f3ff
                `;

        setTimeout(() => {
          element.style.textShadow = "0 0 10px #00f3ff, 0 0 20px #00f3ff";
        }, 50);
      }
    }, 100);
  });
}

// ========================================
// TYPING EFFECT FOR ENTRY SUBTITLE
// ========================================

function initTypingEffect() {
  const subtitle = document.querySelector(".entry-subtitle");
  if (!subtitle) return;

  const originalText = subtitle.innerHTML;
  subtitle.innerHTML = "";

  let charIndex = 0;
  const typingSpeed = 50;

  function type() {
    if (charIndex < originalText.length) {
      subtitle.innerHTML += originalText.charAt(charIndex);
      charIndex++;
      setTimeout(type, typingSpeed);
    }
  }

  setTimeout(type, 500);
}

// ========================================
// SCROLL PROGRESS INDICATOR
// ========================================

function initScrollProgress() {
  const progressBar = document.createElement("div");
  progressBar.style.position = "fixed";
  progressBar.style.top = "0";
  progressBar.style.left = "0";
  progressBar.style.width = "0%";
  progressBar.style.height = "3px";
  progressBar.style.background = "linear-gradient(90deg, #00f3ff, #ff00ff)";
  progressBar.style.zIndex = "10000";
  progressBar.style.boxShadow = "0 0 10px #00f3ff";
  progressBar.style.transition = "width 0.1s ease";
  document.body.appendChild(progressBar);

  window.addEventListener("scroll", throttle(() => {
    const windowHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + "%";
  }, 16));
}

// ========================================
// ACTIVE NAVIGATION HIGHLIGHT
// ========================================

function initActiveNav() {
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-link");

  const handler = throttle(() => {
    let current = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;

      if (pageYOffset >= sectionTop - 200) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.style.color = "var(--color-gray-200)";
      if (link.getAttribute("href") === `#${current}`) {
        link.style.color = "var(--color-neon-cyan)";
      }
    });
  }, 100);

  window.addEventListener("scroll", handler);
}

// ========================================
// EASTER EGG: KONAMI CODE
// ========================================

function initKonamiCode() {
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;

  document.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;

      if (konamiIndex === konamiCode.length) {
        activateMatrixMode();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }
  });
}

function activateMatrixMode() {
  document.body.style.filter = "hue-rotate(90deg)";

  const message = document.createElement("div");
  message.textContent = "MATRIX MODE ACTIVATED";
  message.style.position = "fixed";
  message.style.top = "50%";
  message.style.left = "50%";
  message.style.transform = "translate(-50%, -50%)";
  message.style.fontSize = "3rem";
  message.style.color = "#00ff00";
  message.style.zIndex = "10000";
  message.style.textShadow = "0 0 20px #00ff00";
  document.body.appendChild(message);

  setTimeout(() => {
    document.body.style.filter = "none";
    message.remove();
  }, 3000);
}

// ========================================
// BOOT SEQUENCE
// ========================================

function initBootSequence() {
    const bootSequence = document.getElementById('boot-sequence');
    const bootText = document.getElementById('boot-text');
    if (!bootSequence || !bootText) return;

    document.body.style.overflow = 'hidden';

    const bootLines = [
        "Initializing core systems...",
        "Loading user profile: Kaicheng (Kai) Chu...",
        "Loading aesthetic protocols... ENABLED",
        "Establishing network connection... SUCCESS",
        "ACCESS GRANTED."
    ];

    let dismissed = false;
    const timeouts = [];

    function dismiss() {
        if (dismissed) return;
        dismissed = true;
        bootSequence.removeEventListener('click', dismiss);
        document.removeEventListener('keydown', dismiss);
        timeouts.forEach(clearTimeout);
        bootSequence.classList.add('hidden');
        document.body.style.overflow = 'auto';
        setTimeout(() => bootSequence.remove(), 500);
    }

    bootSequence.addEventListener('click', dismiss);
    document.addEventListener('keydown', dismiss);

    let lineIndex = 0;

    function renderLine() {
        if (dismissed) return;
        if (lineIndex < bootLines.length) {
            const line = document.createElement('div');
            line.textContent = bootLines[lineIndex];
            bootText.appendChild(line);
            lineIndex++;
            const t = setTimeout(renderLine, Math.random() * 80 + 40);
            timeouts.push(t);
        } else {
            const t = setTimeout(dismiss, 400);
            timeouts.push(t);
        }
    }

    const t = setTimeout(renderLine, 200);
    timeouts.push(t);
}

// ========================================
// LANGUAGE TOGGLE (i18n)
// ========================================

function switchLanguage(lang) {
  const t = TRANSLATIONS[lang];
  if (!t) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    if (t[key] !== undefined) el.innerHTML = t[key];
  });

  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'en' ? '\u4e2d\u6587' : 'English';

  document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
  localStorage.setItem('preferred-lang', lang);
}

function initLangToggle() {
  const btn = document.getElementById('lang-toggle');
  if (!btn) return;

  const saved = localStorage.getItem('preferred-lang') || 'en';
  if (saved !== 'en') switchLanguage(saved);

  btn.addEventListener('click', () => {
    const current = localStorage.getItem('preferred-lang') || 'en';
    switchLanguage(current === 'en' ? 'zh' : 'en');
  });
}

// ========================================
// INTERACTIVE TERMINAL
// ========================================

function initInteractiveTerminal() {
    const input = document.getElementById('terminal-input');
    const body = document.getElementById('terminal-body');
    if (!input || !body) return;

    // Focus input when clicking anywhere in terminal body
    body.addEventListener('click', () => {
        input.focus();
    });

    const commands = {
        'help': "Available commands: help, about, skills, contact, clear",
        'about': "Kaicheng (Kai) Chu is an Engineer focusing on Data and Development. Pursuing a Data Science Master Degree at UCLA.",
        'skills': "Primary: Python, SQL, R, Java. Tech: Git, BASH, REST, Cloud(OSS).",
        'contact': "Connect via LinkedIn across the network. System status: OPEN FOR OPPORTUNITIES.",
        'clear': "CLEAR_SCREEN"
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = input.value.trim().toLowerCase();
            if (val) {
                // Remove input line temporarily
                const inputLine = input.parentElement;
                inputLine.remove();

                // Echo the command
                const echoLine = document.createElement('div');
                echoLine.className = 'terminal-line';
                echoLine.innerHTML = `<span class="prompt">guest@kc-system:~$</span> ${val}`;
                body.appendChild(echoLine);

                // Process command
                if (val === 'clear') {
                    // Remove all lines except the first two generic ones if you want, 
                    // or just clear everything
                    body.innerHTML = '';
                } else {
                    const response = commands[val] || `Command not found: ${val}. Type 'help' for available commands.`;
                    const responseLine = document.createElement('div');
                    responseLine.className = 'terminal-line';
                    responseLine.textContent = response;
                    responseLine.style.color = val in commands ? 'var(--color-neon-cyan)' : '#ff5f56';
                    body.appendChild(responseLine);
                }

                // Add input line back
                input.value = '';
                body.appendChild(inputLine);
                input.focus();

                // Auto scroll to bottom
                body.scrollTop = body.scrollHeight;
            }
        }
    });
}

// ========================================
// CUSTOM CURSOR LOGIC
// ========================================

function initCustomCursor() {
  const cursor = document.querySelector(".custom-cursor");
  const follower = document.querySelector(".custom-cursor-follower");
  if (!cursor || !follower) return;

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Instant update for the inner dot
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
  });

  // Smooth follow for the outer ring using lerp
  function animateFollower() {
    followerX += (mouseX - followerX) * 0.15;
    followerY += (mouseY - followerY) * 0.15;

    follower.style.left = followerX + "px";
    follower.style.top = followerY + "px";

    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Add hover states to interactable elements
  const interactables = document.querySelectorAll(
    "a, button, .experience-card, .interest-tag, .photo-item, .nav-logo, .nav-toggle, input, textarea",
  );

  interactables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("cursor-hover");
    });
  });
}

// ========================================
// DAY PROGRESS TRACKER
// ========================================

function initDayProgress() {
  const progressValue = document.getElementById("day-progress-value");
  const progressFill = document.getElementById("day-progress-fill");

  if (!progressValue || !progressFill) return;

  function updateDayProgress() {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );

    const totalMilliseconds = endOfDay - startOfDay;
    const elapsedMilliseconds = now - startOfDay;
    const percentage = (elapsedMilliseconds / totalMilliseconds) * 100;

    // Update the display
    progressValue.textContent = percentage.toFixed(1) + "%";
    progressFill.style.width = percentage.toFixed(1) + "%";
  }

  // Update immediately
  updateDayProgress();

  // Update every minute (60000ms)
  setInterval(updateDayProgress, 60000);
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  // Initialize particle system
  const canvas = document.getElementById("particle-canvas");
  if (canvas) {
    const particleSystem = new ParticleSystem(canvas);
    particleSystem.animate();
  }

  // Initialize all features
  initPhotoWall();       // Build gallery DOM before tilt/parallax attach
  initSmoothScroll();
  initMobileNav();
  initExperienceCards();
  initSkillBarsAnimation();
  initTimelineAnimation();
  initPhotoTilt();
  initPhotoParallax();
  initNavbarScroll();
  initSectionFadeIn();
  initGlitchEffect();
  initTypingEffect();
  initScrollProgress();
    initActiveNav();
    initKonamiCode();
    initDayProgress();
    initCustomCursor();
    initInteractiveTerminal();
    initBootSequence();
    initLangToggle();

  // Optional: Initialize cursor trail (can be disabled if too much)
  // new CursorTrail();

  console.log(
    "%c SYSTEM INITIALIZED ",
    "background: #00f3ff; color: #000; font-size: 20px; font-weight: bold;",
  );
  console.log(
    "%c Welcome to the Cyberpunk Portfolio ",
    "background: #ff00ff; color: #000; font-size: 16px;",
  );
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Debounce function for scroll events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for high-frequency events
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
