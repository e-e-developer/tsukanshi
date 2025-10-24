var bookmarkObj =
{
    db: "TBookMark",
    bookmarkids:{},
    init: function(){
        bookmarkObj.getbookmarkids();
    },
    is_bookmark: function( quizobj )
    {
        
       
            if( !Object.keys(bookmarkObj.bookmarkids).length ){
                bookmarkObj.getbookmarkids();
            }
            
            var quizekey = "";
                quizekey += quizobj.categoryCode+"_";
                quizekey += quizobj.examTimes+"_";
                quizekey += quizobj.mainQuestionSeq+"_";
                quizekey += quizobj.subQuestionSeq;
            return bookmarkObj.bookmarkids[quizekey];

    },
    getbookmarkids: function(){
        bookmarkObj.bookmarkids = {};
        db.transaction(function(tx){
            tx.executeSql("select * from "+bookmarkObj.db, [], function (tx, results) {
                for (var i = 0 ; i < results.rows.length; i++) {
                    if(useSqlite){
                       var row   = results.rows.item(i);
                    }else{
                       var row   = results.rows[i];
                    }
                    bookmarkObj.bookmarkids[ 
                        row.categoryCode+"_"+row.examTimes+"_"+row.mainQuestionSeq+"_"+row.subQuestionSeq
                    ] = row;
                }
                console.log("load bookmark ids");
            });            
        });
    },
    addremove: function(element)
    {
        
    //あとは insert update文で更新してやる

        db.transaction(function(tx){

            var questionjson = $(element).attr("data-quizdata");
            questionjson = JSON.parse(questionjson);
            
            var tmprep = [
                questionjson.categoryCode,
                questionjson.examTimes,
                questionjson.mainQuestionSeq,
                questionjson.subQuestionSeq,
            ];

        

            tx.executeSql("select * from "+bookmarkObj.db+" where categoryCode = ? and examTimes = ? and mainQuestionSeq = ? and subQuestionSeq = ? ", tmprep, function (tx, results) {
                if(useSqlite){
                    var count = results.rows.length;
                }else{
                    var count = results.rows.length;
                }
                if(count > 0){
                    //削除
                    if(useSqlite){
                       var row   = results.rows.item(0);
                    }else{
                       var row   = results.rows[0];
                    }
                    tx.executeSql("delete from "+bookmarkObj.db+" where categoryCode = ? and examTimes = ? and mainQuestionSeq = ? and subQuestionSeq = ? ", tmprep,function(){
                       $('#question-bookmark_'+ questionjson.nodeBaseId+" .star").removeClass("bookmarked");    
                       var errataTable_titleCol_ID = '#errataTable-titleCol_'+questionjson.categoryCode+"_"+questionjson.examTimes+"_"+questionjson.mainQuestionSeq+"_"+questionjson.subQuestionSeq;
                       console.log(errataTable_titleCol_ID+" .star");
                       $(errataTable_titleCol_ID+" .star").addClass("star_dummy");
                       $(errataTable_titleCol_ID+" .star").removeClass("star");
                       bookmarkObj.getbookmarkids();
                    });
                } else {
                    //追加
                    tx.executeSql("insert into "+bookmarkObj.db+" values(?,?,?,?)",tmprep,function(){
                        $('#question-bookmark_'+ questionjson.nodeBaseId+" .star").addClass("bookmarked");
                        var errataTable_titleCol_ID = '#errataTable-titleCol_'+questionjson.categoryCode+"_"+questionjson.examTimes+"_"+questionjson.mainQuestionSeq+"_"+questionjson.subQuestionSeq; 
                        console.log(errataTable_titleCol_ID+" .star_dummy");
                        $(errataTable_titleCol_ID+" .star_dummy").addClass("star");
                        $(errataTable_titleCol_ID+" .star_dummy").removeClass("star_dummy");
                        bookmarkObj.getbookmarkids();
                    });

                }
               return true; 
            });
        },function(e){
            
            return true;
        });
    }

}
