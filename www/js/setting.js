var db;
var setting = {
    //key
    storedQuizObjKey: 'storedQuizObjKey',
    CSVImportedKey: "CSVImported",
    minExamTimes: 51,
    maxExamTimes: 59,
    twoSelectionMaru: "○",
    twoSelectionBatsu: "×",
    twoSelectionStr: "○×",
    //CSV
    quizCSVFilePaths: ["./tuuKanJituMuCSV/", "./tuuKanGyouHouCSV/", "./kaiGyouHouCSV/"],
    questionCSVNames: ["59","58","57","56","55","54","53","52","51"],
    //DB
    dbName: "TuuKanSi",
    dbSize: 5242880,
    TTuuKanGyouHouQuiz: "TTuuKanGyouHouQuiz",
    TKaiGyouHouQuiz: "TKaiGyouHouQuiz",
    TTuuKanJituMuQuiz: "TTuuKanJituMuQuiz",
    TAnswerHistry: "TAnswerHistry",
    TBookMark: "TBookMark",
    TAllAnswerHistry: "TAllAnswerHistry",
    answerHistryPrimaryKeyCount: 4,
    TAnswerHistryCreateQuery:
          ' categoryCode INTEGER, dataType TEXT , examTimes INTEGER, mainQuestionSeq INTEGER, subQuestionSeq INTEGER'
        + ', answer_1 INTEGER, answer_2 INTEGER, answer_3 INTEGER, answer_4 INTEGER, answer_5 INTEGER'
        + ', answer_count INTEGER'
        + ', PRIMARY KEY (categoryCode, dataType,examTimes, mainQuestionSeq, subQuestionSeq)',
    AddTAnswerHistryCreateQuery:
           ['answer_1_date DATETIME','answer_2_date DATETIME','answer_3_date DATETIME','answer_4_date DATETIME','answer_5_date DATETIME'] ,
    DataType:[
        "all",
        "suball",
        "quiz",
    ],
    TAnswerCountHistry: "TAnswerCountHistry",
    TAnswerCountHistryInsertQuery:
        ' ' + 'categoryCode INTEGER'
      + ',' + 'dataType TEXT'
      + ',' + 'answerCount INTEGER'
      + ',' + 'PRIMARY KEY (categoryCode,dataType)',
    TBookMarkCreateQuery:
          ' categoryCode INTEGER, examTimes INTEGER, mainQuestionSeq INTEGER, subQuestionSeq INTEGER',
   TAllAnswerCountHistry: "TAllAnswerCountHistry",
   TAllAnswerHistryCreateQuery:
          ' categoryCode INTEGER,dataType TEXT, answerTotal INTEGER,answerTrue INTEGER,answerFalse INTEGER,anwer_date DATETIME'
        + ', PRIMARY KEY (categoryCode,dataType)',
    TQuizCreateQuery:
    {
        categoryQuizSeq: "categoryQuizSeq INTEGER",
        categoryCode: "categoryCode INTEGER",
        categoryName: "categoryName TEXT",
        subCategoryName: "subCategoryName TEXT",
        examTimes: "examTimes INTEGER",
        mainQuestionSeq: "mainQuestionSeq INTEGER",
        subQuestionSeq: "subQuestionSeq INTEGER",
        importanceRank: "importanceRank TEXT",
        question: "question TEXT",
        stampTwoSelections: "stampTwoSelections INTEGER",
        selection: "selection TEXT",
        answerKey: "answerKey TEXT",
        explanation: "explanation TEXT",
        stampCorrectAnswer: "stampCorrectAnswer INTEGER",
        primaryKeys: ["categoryCode", "examTimes", "mainQuestionSeq", "subQuestionSeq"]
    },
    tuuKanGyouHouCategoryCodes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    kaiGyouHouCategoryCodes: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56],
    tuuKanJituMuCategoryCodes: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86],
    errataTableInitDispayCategoryCode: [1,2,3,4,5,6,7],
    largeCategories: ["通関業法", "関税法等", "通関実務"],
    largeCategoryTableMap:
    {
        "通関業法": "TTuuKanGyouHouQuiz",
        "関税法等": "TKaiGyouHouQuiz",
        "通関実務": "TTuuKanJituMuQuiz"
    },
     categoryCodeMap:
    {
        //通関業法
        "通関業法（定義、目的（通関業法））": 1,
        "通関業法（通関業の許可）": 2,
        "通関業法（許可等に基づく地位の承継）": 3,
        "通関業法（通関業者、通関士等の義務）": 4,
        "通関業法（通関業者の権利）": 5,
        "通関業法（通関士の確認）": 6,
        "通関業法（通関士の資格喪失）": 7,
        "通関業法（通関士試験）": 8,
        "通関業法（通関業者に対する監督処分）": 9,
        "通関業法（通関業者に対する業務改善命令）": 10,
        "通関業法（通関士に対する懲戒処分）": 11,
        "通関業法（権限の委任）": 12,
        "通関業法（罰則（通関業法））": 13,
        //関税法等
        "関税法等（通則）": 14,
        "関税法等（課税価格の決定）": 15,
        "関税法等（定義（関税法等））": 16,
        "関税法等（期間の計算と期限の特例）": 17,
        "関税法等（災害等による期限の延長）": 18,
        "関税法等（輸出通関）": 19,
        "関税法等（輸入通関）": 20,
        "関税法等（輸出申告の特例）": 21,
        "関税法等（輸入申告の特例）": 22,
        "関税法等（輸入してはならない貨物）": 23,
        "関税法等（輸出してはならない貨物）": 24,
        "関税法等（郵便物の輸出入）": 25,
        "関税法等（関税関係帳簿等）": 26,
        "関税法等（AEO事業者等になるための要件と失効・取消し等）": 27,
        "関税法等（許可等に基づく地位の承継）": 28,
        "関税法等（保税地域）": 29,
        "関税法等（保税運送）": 30,
        "関税法等（収容、留置）": 31,
        "関税法等（課税物件確定時期と適用法令）": 32,
        "関税法等（納税義務者）": 33,
        "関税法等（関税の確定）": 34,
        "関税法等（賦課権の期間制限と徴収権の消滅時効）": 35,
        "関税法等（関税の納付）": 36,
        "関税法等（法定納期限と納期限）": 37,
        "関税法等（還付）": 38,
        "関税法等（関税の徴収）": 39,
        "関税法等（担保）": 40,
        "関税法等（延滞税）": 41,
        "関税法等（加算税）": 42,
        "関税法等（不服申立て、取消しの訴え）": 43,
        "関税法等（税関事務管理人）": 44,
        "関税法等（税関職員又は税関長の権限）": 45,
        "関税法等（罰則（関税法））": 46,
        "関税法等（関税率）": 47,
        "関税法等（関税額）": 48,
        "関税法等（特殊関税）": 49,
        "関税法等（減免戻し税）": 50,
        "関税法等（WTO協定）": 51,
        "関税法等（特恵関税、経済連携協定）": 52,
        "関税法等（NACCS法）": 53,
        "関税法等（関税法等の特例法）": 54,
        "関税法等（外国為替及び外国貿易法）": 55,
        "関税法等（関税率表）": 56,
        //通関実務
        //TODO:CSVの仮データ？
        "通関実務（通則）": 57,
        "通関実務（課税価格の決定）": 58,
        "通関実務（定義（関税法等））": 59,
        "通関実務（輸出通関）": 60,
        "通関実務（輸入通関）": 61,
        "通関実務（輸出申告の特例）": 62,
        "通関実務（輸入申告の特例）": 63,
        "通関実務（輸出してはならない貨物）": 64,
        "通関実務（郵便物の輸出入）": 65,
        "通関実務（関税関係帳簿等）": 66,
        "通関実務（保税地域）": 67,
        "通関実務（保税運送）": 68,
        "通関実務（収容、留置）": 69,
        "通関実務（課税物件確定時期と適用法令）": 70,
        "通関実務（関税の確定）": 71,
        "通関実務（事前教示（事前照会））": 72,
        "通関実務（関税の納付）": 73,
        "通関実務（法定納期限と納期限）": 74,
        "通関実務（還付）": 75,
        "通関実務（関税の徴収）": 76,
        "通関実務（担保）": 77,
        "通関実務（延滞税）": 78,
        "通関実務（加算税）": 79,
        "通関実務（税関事務管理人）": 80,
        "通関実務（開庁時間外事務執行の求め）": 81,
        "通関実務（罰則（関税法））": 82,
        "通関実務（減免戻し税）": 83,
        "通関実務（特恵関税、経済連携協定）": 84,
        "通関実務（関税率）": 85,
        "通関実務（関税率表）": 86,
        //"通関実務（税額計算）": 31,
        //"通関実務（課税価格の計算）": 32,
        //"通関実務（その他）": 33
    }

};
