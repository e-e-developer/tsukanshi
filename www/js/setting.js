var db;
var setting = {
    //key
    storedQuizObjKey: 'storedQuizObjKey',
    CSVImportedKey: "CSVImported",
    minExamTimes: 51,
    maxExamTimes: 58,
    twoSelectionMaru: "○",
    twoSelectionBatsu: "×",
    twoSelectionStr: "○×",
    //CSV
    quizCSVFilePaths: ["./tuuKanJituMuCSV/", "./tuuKanGyouHouCSV/", "./kaiGyouHouCSV/"],
    questionCSVNames: ["58","57","56","55","54","53","52","51"],
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
        question: "question TEXT",
        stampTwoSelections: "stampTwoSelections INTEGER",
        selection: "selection TEXT",
        answerKey: "answerKey TEXT",
        explanation: "explanation TEXT",
        stampCorrectAnswer: "stampCorrectAnswer INTEGER",
        importanceRank: "importanceRank TEXT",
        primaryKeys: ["categoryCode", "examTimes", "mainQuestionSeq", "subQuestionSeq"]
    },
    tuuKanGyouHouCategoryCodes: [1,2,3,4,5,6,7],
    kaiGyouHouCategoryCodes: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
    tuuKanJituMuCategoryCodes: [31,32,33],
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
        "通関業法（通関業の許可）": 1,
        "通関業法（通関業者・通関士の義務）": 2,
        "通関業法（通関業者の権利）": 3,
        "通関業法（通関士の資格）": 4,
        "通関業法（行政処分）": 5,
        "通関業法（罰則）": 6,
        "通関業法（その他）": 7,
        //関税法等
        "関税法（認定通関業者）": 8,
        "関税法（関税の確定・納付）": 9,
        "関税法（附帯税）": 10,
        "関税法（輸出通関）": 11,
        "関税法（輸入通関）": 12,
        "関税法（他法令の証明・確認）": 13,
        "関税法（原産地表示）": 14,
        "関税法（輸出してはならない貨物）": 15,
        "関税法（輸入してはならない貨物）": 16,
        "関税法（保税地域）": 17,
        "関税法（運送）": 18,
        "関税法（不服申立て）": 19,
        "関税法（罰則）": 20,
        "関税法（定義）": 21,
        "関税定率法（定義、関税率、その他）": 22,
        "関税定率法（課税価格の決定）": 23,
        "関税定率法（特殊関税）": 24,
        "関税定率法（軽減・免除・払戻し）": 25,
        "関税定率法（通則）": 26,
        "関税暫定措置法（軽減・免除・払戻し）": 27,
        "関税暫定措置法（特恵関税）": 28,
        "外国為替及び外国貿易法": 29,
        "関税関係特例法": 30,
        //通関実務
        //TODO:CSVの仮データ？
        "通関実務": 31
        //"通関実務（税額計算）": 31,
        //"通関実務（課税価格の計算）": 32,
        //"通関実務（その他）": 33
    }

};
