import type { WestLakeKey } from '../components/westlake/scenes';
import type { LegKind } from '../lib/journey';

/**
 * Chinese copy. Written for a recruiter first: what was done and what was hard,
 * in plain words. Every figure traces back to the résumé.
 */

/** A run of text; `{ b }` marks the few words a skimming reader should catch. */
export type Rich = ReadonlyArray<string | { readonly b: string }>;

export const SITE_ZH = {
  name: '褚开诚',
  nameLatin: 'Kaicheng Chu',
  title: '褚开诚 Kaicheng Chu',
  description: '褚开诚：UCLA 数据科学工程硕士，2026 年 12 月毕业，在找 AI 相关的工作。一份可以走一遍的简历。',
  motto: 'Sapere aude',
  mottoGloss: '谋定后动，造极登峰',
  navGlance: '速览',
  navLanguage: 'English',
  navLanguageShort: 'EN',
  railLabel: '站点',
  themeGroup: '昼夜',
  themeDay: '白天',
  themeNight: '夜航',
  globeLabel: '一颗缓慢自转的地球，画着从杭州出发的路线。聚焦后可用左右方向键转动。',
} as const;

export interface WorkItem {
  readonly year: string;
  readonly who: string;
  readonly kind: LegKind;
  readonly href: string;
  readonly what: string;
  readonly how: Rich;
}

export const OPENING_ZH = {
  // Two highlights, two colours: yellow for deciding what right means, orange for building it.
  headline: { before: '先定义什么叫', decided: '做对了', then: '再把它', built: '做出来' },
  // No spaces around Latin and digits here: this line is set in a handwriting face,
  // where typed gaps read as hesitations.
  deck: 'UCLA数据科学工程硕士，2026年12月毕业，在找AI相关的工作。背后这颗地球上画的，是我到今天为止走过的路。',
  workTitle: '最近经历',
  work: [
    {
      year: '2026',
      who: 'SDG&E',
      kind: 'work',
      href: '#sdge',
      what: '有据可查的监管问答',
      how: [
        '监管文件很厚，数据散在十几张表里。做了一个能',
        { b: '查文档、查数字、会计算' },
        '，并且',
        { b: '每句话都标明出处' },
        '的问答系统。',
      ],
    },
    {
      year: '2026',
      who: 'UCLA',
      kind: 'study',
      href: '#semg',
      what: '靠手腕的肌电信号打字',
      how: ['不碰键盘，只凭肌电信号认出敲的是哪个键。难点是数据很少，要让模型', { b: '学会读信号' }, '，而不是背下某一个人。'],
    },
    {
      year: '2025',
      who: '极蜂精灵',
      kind: 'work',
      href: '#chengdu',
      what: '让研报自动变成可查的摘要',
      how: [
        '研报格式五花八门，连目录都抓不准。',
        { b: '重做了目录识别和检索' },
        '，还给「摘要好不好」定了一套',
        { b: '能检查的标准' },
        '。',
      ],
    },
  ] satisfies readonly WorkItem[],
  depart: '从杭州出发',
  glance: '30 秒速览',
  legendStudy: '求学',
  legendWork: '实习与项目',
  legendHint: '按住地球可以左右拖动',
  // The station label beside him already says where; this says what the place is to the story.
  kidNote: '从这里开始',
  kidAlt: '小时候的我，站在杭州',
} as const;

export type PhotoKey = 'tennis' | 'elpaso' | 'uva' | 'grad1' | 'grad2' | 'ucla' | 'now' | 'sea' | 'camera' | 'hike';
export type MachineKey = 'report' | 'semg' | 'desk';
export type HobbyKey = 'tennis' | 'gym' | 'reading' | 'photo';
export type ContactKind = 'mail' | 'linkedin' | 'instagram';

export interface StationPhoto {
  readonly key: PhotoKey;
  readonly alt: string;
  readonly caption: string;
}

/** A paragraph to read. A project brings its own name as a small title. */
export interface Passage {
  readonly title?: string;
  readonly text: Rich;
}

/** A school, set like an entry on a transcript. */
export interface SchoolRecord {
  readonly degrees: readonly string[];
  readonly honors: Rich;
  readonly coursesLabel: string;
  readonly courses: readonly string[];
}

/** A piece of research, set like the first page of a paper. */
export interface PaperSheet {
  readonly venue: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly byline: string;
  readonly sections: ReadonlyArray<{ readonly head: string; readonly text: Rich }>;
  /** Odds ratios with their 95% intervals, drawn as a small forest plot. */
  readonly estimates?: ReadonlyArray<{ readonly label: string; readonly ratio: number; readonly low: number; readonly high: number }>;
  readonly estimatesCaption?: string;
}

export interface StationCopy {
  /** Matches a stop id in `lib/journey`. */
  readonly id: string;
  /** Short name for the rail at the top. */
  readonly rail: string;
  readonly kind: LegKind;
  readonly when: string;
  /** The job title or kind of work, where there is one. */
  readonly role?: string;
  readonly place: string;
  /** No punctuation in titles; a space stands in for the pause. */
  readonly title: string;
  readonly lead: Rich;
  /** On a wide screen the lead and each passage keep to one line apiece instead of wrapping. */
  readonly singleLines?: boolean;
  /** Ink sketches of the place, drawn at build time; the note is read out, not shown. */
  readonly sketches?: ReadonlyArray<{ readonly key: WestLakeKey; readonly name: string; readonly note: string }>;
  readonly sketchesLabel?: string;
  readonly school?: SchoolRecord;
  readonly passages?: readonly Passage[];
  readonly paper?: PaperSheet;
  readonly photos?: readonly StationPhoto[];
  readonly machine?: MachineKey;
  /** The one before-and-after worth stating next to a machine. */
  readonly result?: { readonly label: string; readonly from: string; readonly to: string };
  readonly contactTitle?: string;
  readonly contacts?: ReadonlyArray<{ readonly kind: ContactKind; readonly label: string; readonly value: string; readonly href?: string }>;
  readonly hobbiesTitle?: string;
  readonly hobbies?: ReadonlyArray<{ readonly key: HobbyKey; readonly label: string }>;
}

export const JOURNEY_ZH = {
  stations: [
    {
      id: 'hangzhou',
      rail: '杭州',
      kind: 'study',
      when: '起点',
      place: '浙江杭州',
      title: '在杭州长大',
      lead: [{ b: '最忆是杭州' }],
      sketchesLabel: '西湖五景，水墨简笔',
      sketches: [
        { key: 'duanqiao', name: '断桥残雪', note: '雪后桥背先化，远看像断了' },
        { key: 'santan', name: '三潭印月', note: '湖心三座小石塔，月夜里塔窗映月' },
        { key: 'leifeng', name: '雷峰夕照', note: '夕阳落在雷峰塔后面' },
        { key: 'sudi', name: '苏堤春晓', note: '春天清早的长堤，柳树和桃花' },
        { key: 'quyuan', name: '曲院风荷', note: '夏天的荷叶和荷花' },
      ],
    },
    {
      id: 'el-paso',
      rail: 'El Paso',
      kind: 'study',
      when: '2018–2019',
      place: '得克萨斯州 El Paso，Chapin High School',
      title: '交换的一年',
      lead: ['通过浙江省的 AYA（Academic Year in America）项目，到美墨边境的 El Paso 读了一年高中。'],
      passages: [
        {
          text: [
            '课内，参加 University Interscholastic League（得州校际联盟）的数学邀请赛，十年级组',
            { b: '半决赛第四、决赛第六' },
            '。课外进了校网球队，拿下春季 JV ',
            { b: '区双打冠军' },
            '。',
          ],
        },
        { text: ['周末跟着得州卫生与公众服务委员会的社区关系主任，给无家可归的人分发物资。'] },
      ],
      photos: [
        { key: 'tennis', alt: 'Chapin 高中网球队在球场上的合影', caption: '校网球队' },
        { key: 'elpaso', alt: '和两位朋友在生日会上各自捧着一本书', caption: '在 El Paso' },
      ],
    },
    {
      id: 'miller',
      rail: 'Miller',
      kind: 'study',
      when: '2019–2021',
      place: '弗吉尼亚州，Miller School of Albemarle',
      title: '用数据回答一个问题',
      lead: ['高中的最后两年。自己提出一个问题，再', { b: '找数据去回答它' }, '。'],
      singleLines: true,
      passages: [
        { text: ['以 ', { b: 'Valedictorian' }, '（毕业生代表）身份毕业。'] },
        { text: ['课余带 Animal Adventure 社团：办濒危物种讲座，种树、钓鱼、徒步。'] },
      ],
      paper: {
        venue: 'European Journal of Biomedical and Life Sciences',
        title: 'Negative effect of breakfast skipping',
        subtitle: 'Findings among adolescents of the United States',
        byline: 'Kaicheng Chu，Miller School of Albemarle，独立研究',
        sections: [
          { head: '目的', text: ['不吃早餐，对青少年的体重和学业有没有负面影响。'] },
          { head: '数据', text: ['美国疾控中心 2017 年青少年风险行为调查（YRBSS），最终样本 9,361 名高中生。'] },
          { head: '方法', text: ['两个逻辑回归模型，控制年龄、性别、族裔和其他饮食习惯。'] },
          { head: '结果', text: ['约 14% 的高中生不吃早餐。不吃早餐与', { b: '超重或肥胖' }, '、与', { b: '成绩不到 A' }, '都显著相关。'] },
        ],
        estimates: [
          { label: '超重或肥胖', ratio: 1.3523, low: 1.1919, high: 1.533 },
          { label: '成绩不到 A', ratio: 1.444, low: 1.263, high: 1.652 },
        ],
        estimatesCaption: '不吃早餐的优势比与 95% 置信区间。虚线是 1，表示没有差别。',
      },
    },
    {
      id: 'uva',
      rail: 'UVA',
      kind: 'study',
      when: '2021–2025',
      place: '弗吉尼亚大学，Charlottesville',
      title: '四年 两个学位',
      lead: ['计算机和统计，两个专业一起读了四年。'],
      school: {
        degrees: ['计算机科学 理学学士', '统计学 文学学士'],
        honors: ['连续八个学期进入 ', { b: 'Dean’s List' }, '，以 ', { b: 'Highest Distinction' }, ' 毕业。'],
        coursesLabel: '修过的课',
        courses: ['计算机视觉', '人工智能', '数据库', '机器学习', '数据分析'],
      },
      passages: [
        {
          title: 'E-Commerce Customer Analytics',
          text: [
            '一百多万条用户记录里，评论、交易和营销邮件混在一起。先判断评论是夸是骂，再预测谁会下单，最后从一场四十八万人的邮件实验里找出',
            { b: '该发多勤' },
            '。',
          ],
        },
        {
          title: 'Real-time Emotion Recognition',
          text: ['用摄像头', { b: '实时识别人的情绪' }, '：先找到脸，再让一个微调过的图像模型判断是六种情绪里的哪一种。'],
        },
        {
          title: 'Charlottesville Travel Planner',
          text: ['一个旅行网站：告诉它你有多少时间、喜欢什么，它', { b: '排出一条行程' }, '。上线前找真实用户测过一轮。'],
        },
      ],
      paper: {
        venue: '研究助理期间，与 Panagiotis Apostolellis 副教授合著',
        title: 'Project-Based Learning: Chimera or Hestia for Design Engineering Pedagogy during Unprecedented Times?',
        byline: 'Panagiotis Apostolellis，Kaicheng Chu，弗吉尼亚大学计算机系',
        sections: [
          { head: '问题', text: ['疫情让授课方式几度切换。项目制学习撑住了吗？又是什么最能预测学生的成绩？'] },
          { head: '数据', text: ['一门项目制设计工程课，四年八个学期（2019 秋至 2023 春），571 名本科生的问卷和成绩。'] },
          { head: '方法', text: ['方差分析比较不同授课方式；线性混合效应模型，把个人层面和小组层面的因素分开。'] },
          {
            head: '结果',
            text: [
              '回到教室时，学习动机和项目成绩受到的冲击最大，课程总成绩不受授课方式影响。',
              { b: '团队效能和团队冲突' },
              '是成绩最显著的预测因素，对成绩偏低的小组尤其如此。',
            ],
          },
        ],
      },
      photos: [
        { key: 'uva', alt: '穿着学位服站在弗吉尼亚大学 Rotunda 前', caption: '毕业那天' },
        { key: 'grad1', alt: '和一位朋友披着毕业肩带，站在红砖楼前的树下', caption: '一起毕业' },
        { key: 'grad2', alt: '和同学站在 2025 届的气球前', caption: '2025 届' },
      ],
    },
    {
      id: 'shaoxing',
      rail: '绍兴',
      kind: 'work',
      when: '2024 夏',
      role: '全栈开发实习',
      place: '浙江绍兴，普康生物',
      title: '第一次从需求走到交付',
      lead: ['入选学生职业项目，和队友从零做一套公司日志系统。', { b: '需求调研、系统设计、开发、内测、汇报' }, '，这五步第一次完整走了一遍。'],
    },
    {
      id: 'chengdu',
      rail: '成都',
      kind: 'work',
      when: '2025 夏',
      role: 'AI Data 工程师实习',
      place: '四川成都，极蜂精灵',
      title: '几百份研报 怎么知道摘要写对了',
      lead: ['替做证券研究的人读完每天几百份研报和公告，写成长短两种摘要。'],
      machine: 'report',
      result: { label: '摘要综合准确率', from: '54%', to: '72%' },
    },
    {
      id: 'ucla',
      rail: 'UCLA',
      kind: 'study',
      when: '2025–2026',
      place: '加州洛杉矶，UCLA',
      title: '在 UCLA 读数据科学',
      lead: ['从东海岸搬到西海岸，读一年多的工程硕士。'],
      school: {
        degrees: ['数据科学 工程硕士'],
        honors: ['获得', { b: '院系奖学金' }, '（Department Financial Award），2026 年 12 月毕业。'],
        coursesLabel: '修过的课',
        courses: ['深度学习', '大规模机器学习', '大数据分析', '自然语言处理'],
      },
      photos: [{ key: 'ucla', alt: '站在 UCLA 工学院的门牌前', caption: '工学院门口' }],
    },
    {
      id: 'semg',
      rail: 'sEMG',
      kind: 'study',
      when: '2026 初',
      role: '深度学习研究项目',
      place: '加州洛杉矶，UCLA',
      title: '不碰键盘 靠手腕的肌电信号打字',
      lead: ['两只腕带贴着手腕，读出肌肉的电信号，认出敲的是哪个键。'],
      machine: 'semg',
      result: { label: '每 100 个字符里的错字', from: '76 个', to: '10 个' },
    },
    {
      id: 'sdge',
      rail: 'SDG&E',
      kind: 'work',
      when: '2026 夏',
      role: 'AI Engineer 实习',
      place: '加州，SDG&E 与 UCLA 的合作项目',
      title: '监管文件里的一个问题 怎样得到能溯源的答案',
      lead: ['SDG&E 是圣地亚哥的燃气电力公司。它的监管信息一半在很厚的 PDF 里，一半在十几张数据表里，一个问题常常两边都要查，还要算数。'],
      machine: 'desk',
      result: { label: '查数字时，第一条就答对的比例', from: '11.7%', to: '75.0%' },
    },
    {
      id: 'next',
      rail: '待续',
      kind: 'study',
      when: '2026 年 12 月',
      place: '毕业',
      title: '待续',
      lead: ['在找 AI 相关的工作。最擅长的是夹在中间的那件事：', { b: '先和人把「做对了」说清楚，再把它做出来' }, '。'],
      contactTitle: '找我',
      contacts: [
        { kind: 'mail', label: 'Gmail', value: 'chukaicheng1@gmail.com', href: 'mailto:chukaicheng1@gmail.com' },
        { kind: 'mail', label: '163 邮箱', value: 'chu_kaicheng915@163.com', href: 'mailto:chu_kaicheng915@163.com' },
        { kind: 'linkedin', label: 'LinkedIn', value: 'kaicheng-chu', href: 'https://www.linkedin.com/in/kaicheng-chu-a96b6821b' },
        { kind: 'instagram', label: 'Instagram', value: 'ckaic_kkkkk', href: 'https://www.instagram.com/ckaic_kkkkk/' },
      ],
      hobbiesTitle: '不写代码的时候',
      hobbies: [
        { key: 'tennis', label: '网球' },
        { key: 'gym', label: '健身' },
        { key: 'reading', label: '阅读' },
        { key: 'photo', label: '拍摄' },
      ],
      photos: [
        { key: 'now', alt: '现在的我，站在 UCLA 的喷泉前', caption: '现在' },
        { key: 'camera', alt: '举着相机拍照', caption: '拍东西' },
        { key: 'sea', alt: '傍晚坐在海边', caption: '看海' },
        { key: 'hike', alt: '徒步途中坐在林间的石头上', caption: '走山路' },
      ],
    },
  ] satisfies readonly StationCopy[],
} as const;
