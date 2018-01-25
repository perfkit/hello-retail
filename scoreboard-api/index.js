
var request = require("request")


exports.handler = (event, context, callback) => {
  var score_c = ''
  var role_c = ''
  var userId_c = ''
  var updatedBy_c = ''
  
  var score_p = ''
  var role_p = ''
  var userId_p = ''
  var updatedBy_p = ''

  // console.log('HERE 3', event['Records'][0]['dynamodb']['NewImage'])


  
  // if (event['Records'][1] == 'undefined' || event['Records'][0] == 'undefined'){
  //   score_c = event['Records'][0]['dynamodb']['NewImage']['score'] 
  //   role_c = event['Records'][0]['dynamodb']['NewImage']['role']['S']
  //   userId_c = event['Records'][0]['dynamodb']['NewImage']['userId']
  //   updatedBy_c = event['Records'][0]['dynamodb']['NewImage']['updatedBy']
  // }
  
  // else if (event['Records'][0]['dynamodb']['OldImage']['role'] == 'photographer') {
  //   score_p = event['Records'][0]['dynamodb']['OldImage']['score']
  //   role_p = event['Records'][0]['dynamodb']['OldImage']['role']['S']
  //   userId_p = event['Records'][0]['dynamodb']['OldImage']['userId']
  //   updatedBy_p = event['Records'][0]['dynamodb']['OldImage']['updatedBy']
    
  //   score_c = event['Records'][1]['dynamodb']['NewImage']['score']
  //   role_c = event['Records'][1]['dynamodb']['NewImage']['role']['S']
  //   userId_c = event['Records'][1]['dynamodb']['NewImage']['userId']
  //   updatedBy_c = event['Records'][1]['dynamodb']['NewImage']['updatedBy']
      
  // } else {
  //   score_c = event['Records'][0]['dynamodb']['NewImage']['score'] //potentially need to remove the {S: ...}
  //   role_c = event['Records'][0]['dynamodb']['NewImage']['role']['S']
  //   userId_c = event['Records'][0]['dynamodb']['NewImage']['userId']
  //   updatedBy_c = event['Records'][0]['dynamodb']['NewImage']['updatedBy']
    
  //   score_p = event['Records'][1]['dynamodb']['NewImage']['score']
  //   role_p = event['Records'][1]['dynamodb']['NewImage']['role']['S']
  //   userId_p = event['Records'][1]['dynamodb']['NewImage']['userId']
  //   updatedBy_p = event['Records'][1]['dynamodb']['NewImage']['updatedBy']
  
  // }
  
  var i = 0
  const url = "https://7seeccgqt5guznacn4lyxcue6q.appsync-api.us-west-2.amazonaws.com/graphql"
  var options = {}


  while(typeof event['Records'][i] !== 'undefined'){
    console.log("Name", event['Records'][i]['eventName'])
    console.log("dynamodb", event['Records'][i]['dynamodb'])
    console.log('i = ', i)
    if (event['Records'][i]['dynamodb']['NewImage']['role']['S'] == 'photographer') {
      score_p = event['Records'][i]['dynamodb']['NewImage']['score']['N']
      role_p = event['Records'][i]['dynamodb']['NewImage']['role']['S']
      userId_p = event['Records'][i]['dynamodb']['NewImage']['userId']['S']
      updatedBy_p = event['Records'][i]['dynamodb']['NewImage']['updatedBy']['S']
      
      
      options = {
        url,
        headers: {
          "x-api-key": "da1-OHdvs8Q4QgeMEfTAPDPJcQ"
        },
        method: "POST",
        json: true,
        body: {
          "operationName": "AddTransactionMutation",
          "variables": {
            "role": role_p,
            "score": score_p,
            "updatedBy": updatedBy_p,
          },
          "query": "mutation AddTransactionMutation($role: String, $score: Int, $updatedBy: String) {\n  addTransaction(role: $role, score: $score, updatedBy: $updatedBy) {\n    __typename\n    userId\n    role\n    score\n       updatedBy\n }\n}\n"
        }
      }
      request(options, callback(null, 'Hello from Lambda'))
      
    } else if (event['Records'][i]['dynamodb']['NewImage']['role']['S'] == 'creator'){
      score_c = event['Records'][i]['dynamodb']['NewImage']['score']['N']
      role_c = event['Records'][i]['dynamodb']['NewImage']['role']['S']
      userId_c = event['Records'][i]['dynamodb']['NewImage']['userId']['S']
      updatedBy_c = event['Records'][i]['dynamodb']['NewImage']['updatedBy']['S']
      
      
      options = {
        url,
        headers: {
          "x-api-key": "da1-OHdvs8Q4QgeMEfTAPDPJcQ"
        },
        method: "POST",
        json: true,
        body: {
          "operationName": "AddTransactionMutation",
          "variables": {
            "role": role_c,
            "score": score_c,
            "updatedBy": updatedBy_c,
          },
          "query": "mutation AddTransactionMutation($role: String, $score: Int, $updatedBy: String) {\n  addTransaction(role: $role, score: $score, updatedBy: $updatedBy) {\n    __typename\n    userId\n    role\n    score\n       updatedBy\n }\n}\n"
        }
      }
      request(options, (err, meta, body) => {
        if (err) {
          return console.log('FAILED TO POST:', err)
        }
        console.log('DONE')
      })
      
    } else {
      console.log('nothing here')
    }
    i = i + 1
  }


  console.log('WOW LOOK HERE', score_c)
  console.log('WOW LOOK HERE', role_c)
  console.log('WOW LOOK HERE', userId_c)
  console.log('WOW LOOK HERE', updatedBy_c)



  // fetch.fetchUrl(url, options,callback(null, 'Hello from Lambda'))
}

// type Transaction {
//  userId: String!
//  role: String
//  updatedBy: String
//  score: Int
// }