
import { ConversationChain } from "langchain/chains";
import { NextRequest, NextResponse } from "next/server";
import { BufferMemory } from "langchain/memory";
import { ChatGroq } from "@langchain/groq";
import { UpstashRedisChatMessageHistory } from "@langchain/community/stores/message/upstash_redis";
import {Redis } from "@upstash/redis"
import {z} from "zod";
import { DynamicStructuredTool } from "@langchain/core/tools";
import yahooFinance from "yahoo-finance2";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";

export async function POST(request: NextRequest) {
    const input = await request.json();
    
    if (!input.messages || input.messages.trim() === "") {
        return NextResponse.json({ response: "Input seems to be blank, please input something." });
    }

    const groq = new ChatGroq(
        {
            apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
            model: "llama3-70b-8192",
        
        }
    );

    const chatHistory = new UpstashRedisChatMessageHistory({
        sessionId: input.sessionId, // Or some8 other unique identifier for the conversation
        sessionTTL: 300, // 5 minutes, omit this parameter to make sessions never expire
        client:  new Redis({
            url: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL,
            token: process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN,
          })
        
      })

    if (input.type === "/finance") {
    
        const infoToolSchema = z.object({
            symbol: z.string(),
            key: z.string()
        });
        const infoTool = new DynamicStructuredTool({
            name: "info",
            description: 
            `
                Return the correct stock info value given the appropriate symbol and key. Infer valid key from the user prompt; it must be one of the following:

                address1, city, state, zip, country, phone, website, industry, industryKey, industryDisp, sector, sectorKey, sectorDisp, longBusinessSummary, fullTimeEmployees, companyOfficers, auditRisk, boardRisk, compensationRisk, shareHolderRightsRisk, overallRisk, governanceEpochDate, compensationAsOfEpochDate, maxAge, priceHint, previousClose, open, dayLow, dayHigh, regularMarketPreviousClose, regularMarketOpen, regularMarketDayLow, regularMarketDayHigh, dividendRate, dividendYield, exDividendDate, beta, trailingPE, forwardPE, volume, regularMarketVolume, averageVolume, averageVolume10days, averageDailyVolume10Day, bid, ask, bidSize, askSize, marketCap, fiftyTwoWeekLow, fiftyTwoWeekHigh, priceToSalesTrailing12Months, fiftyDayAverage, twoHundredDayAverage, currency, enterpriseValue, profitMargins, floatShares, sharesOutstanding, sharesShort, sharesShortPriorMonth, sharesShortPreviousMonthDate, dateShortInterest, sharesPercentSharesOut, heldPercentInsiders, heldPercentInstitutions, shortRatio, shortPercentOfFloat, impliedSharesOutstanding, bookValue, priceToBook, lastFiscalYearEnd, nextFiscalYearEnd, mostRecentQuarter, earningsQuarterlyGrowth, netIncomeToCommon, trailingEps, forwardEps, pegRatio, enterpriseToRevenue, enterpriseToEbitda, 52WeekChange, SandP52WeekChange, lastDividendValue, lastDividendDate, exchange, quoteType, symbol, underlyingSymbol, shortName, longName, firstTradeDateEpochUtc, timeZoneFullName, timeZoneShortName, uuid, messageBoardId, gmtOffSetMilliseconds, currentPrice, targetHighPrice, targetLowPrice, targetMeanPrice, targetMedianPrice, recommendationMean, recommendationKey, numberOfAnalystOpinions, totalCash, totalCashPerShare, ebitda, totalDebt, quickRatio, currentRatio, totalRevenue, debtToEquity, revenuePerShare, returnOnAssets, returnOnEquity, freeCashflow, operatingCashflow, earningsGrowth, revenueGrowth, grossMargins, ebitdaMargins, operatingMargins, financialCurrency, trailingPegRatio
                
                If asked generically for 'stock price', use currentPrice
            `
            ,
            schema: infoToolSchema,
            // faster version with low acc
            // func: async ({symbol,key}) => {Fles: ['price', 'summaryDetail','assetProfile'] }
            //     const data = await yahooFinance.quoteSummary(symbol,queryOptions as any);
            //     const stock_info = data           
            //     return stock_info![key].toString();
            // }

            // slower version with high acc
            func: async ({symbol, key}) => {
                const data = await yahooFinance.quoteSummary(symbol, { modules: ['price', 'summaryDetail', 'assetProfile'] });
                
                // Flatten the data into a single object
                const mergedData = {
                    ...data.price,
                    ...data.summaryDetail,
                    ...data.assetProfile
                };
        
                // Return the value for the requested key
                return mergedData[key]?.toString() ?? `Key "${key}" not found.`;
            }

        });

        
        
        
        const memory = new BufferMemory({
            chatHistory: chatHistory,
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            outputKey: "output",
            
        });
        
        // const conversationChain = new ConversationChain({
        //     llm: groq,
        //     memory: memory,
        // });

        
        // const res = await conversationChain.invoke({'input':input.messages});
        // const stream = await conversationChain.stream(input.message)
        // for await (const chunk of stream) {
        //     console.log(chunk.tool_call_chunks);
        //   }

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", 
            `
            You are my financial advisor. I can provide you with information about any stock. 
            Just ask me about a stock and I will provide you with the information you need.
            You will be feed with the data of the stock that will be ask for with the form like :
            If you was asked for currentPrice of the stock you just need to fetch with the key as regularMarketPrice
            I will give you sample as it will return a json with 3 thing: summaryDetail, price, assetProfile
            summaryDetail: 
                maxAge: 1,
                priceHint: 2,
                previousClose: 2828,
                open: 2843,
                dayLow: 2776,
                dayHigh: 2853,
                regularMarketPreviousClose: 2828,
                regularMarketOpen: 2843,
                regularMarketDayLow: 2776,
                regularMarketDayHigh: 2853,
                payoutRatio: 0,
                beta: 0.693054,
                volume: 1004034,
                regularMarketVolume: 1004034,
                averageVolume: 1831257,
                averageVolume10days: 2115356,
                averageDailyVolume10Day: 2115356,
                bid: 2788,
                ask: 2790,
                bidSize: 0,
                askSize: 0,
                marketCap: 20966455296,
                fiftyTwoWeekLow: 994.012,
                fiftyTwoWeekHigh: 2914,
                priceToSalesTrailing12Months: 10.691171,
                fiftyDayAverage: 2477.3635,
                twoHundredDayAverage: 2397.2805,
                currency: 'GBp',
                fromCurrency: null,
                toCurrency: null,
                lastMarket: null,
                algorithm: null,
                tradeable: false
            ,

            price: 
                maxAge: 1,
                regularMarketChangePercent: -0.00990099,
                regularMarketChange: -28,
                regularMarketTime: new Date("2021-02-02T16:35:44.000Z"),
                priceHint: 2,
                regularMarketPrice: 2800,
                regularMarketDayHigh: 2853,
                regularMarketDayLow: 2776,
                regularMarketVolume: 1004034,
                averageDailyVolume10Day: 2115356,
                averageDailyVolume3Month: 1831257,
                regularMarketPreviousClose: 2828,
                regularMarketSource: 'DELAYED',
                regularMarketOpen: 2843,
                exchange: 'LSE',
                exchangeName: 'LSE',
                exchangeDataDelayedBy: 20,
                marketState: 'PREPRE',
                quoteType: 'EQUITY',
                symbol: 'OCDO.L',
                underlyingSymbol: null,
                shortName: 'OCADO GROUP PLC ORD 2P',
                longName: 'Ocado Group plc',
                currency: 'GBp',
                quoteSourceName: 'Delayed Quote',
                currencySymbol: '£',
                fromCurrency: null,
                toCurrency: null,
                lastMarket: null,
                marketCap: 20966455296
            
            ,
            assetProfile: 
                address1: 'One Apple Park Way',
                city: 'Cupertino',
                state: 'CA',
                zip: '95014',
                country: 'United States',
                phone: '408-996-1010',
                website: 'http://www.apple.com',
                industry: 'Consumer Electronics',
                sector: 'Technology',
                longBusinessSummary: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, HomePod, iPod touch, and other Apple-branded and third-party accessories. It also provides AppleCare support services; cloud services store services; and operates various platforms, including the App Store, that allow customers to discover and download applications and digital content, such as books, music, video, games, and podcasts. In addition, the company offers various services, such as Apple Arcade, a game subscription service; Apple Music, which offers users a curated listening experience with on-demand radio stations; Apple News+, a subscription news and magazine service; Apple TV+, which offers exclusive original content; Apple Card, a co-branded credit card; and Apple Pay, a cashless payment service, as well as licenses its intellectual property. The company serves consumers, and small and mid-sized businesses; and the education, enterprise, and government markets. It sells and delivers third-party applications for its products through the App Store. The company also sells its products through its retail and online stores, and direct sales force; and third-party cellular network carriers, wholesalers, retailers, and resellers. Apple Inc. was founded in 1977 and is headquartered in Cupertino, California.',
                fullTimeEmployees: 147000,
                companyOfficers: [
                
                    maxAge: 1,
                    name: 'Mr. Timothy D. Cook',
                    age: 59,
                    title: 'CEO & Director',
                    yearBorn: 1961,
                    fiscalYear: 2020,
                    totalPay: 14769259,
                    exercisedValue: 0,
                    unexercisedValue: 0
                ,
                /* ... */
                ],
                auditRisk: 1,
                boardRisk: 1,
                compensationRisk: 3,
                shareHolderRightsRisk: 1,
                overallRisk: 1,
                governanceEpochDate: new Date("2021-01-22T00:00:00.000Z"),
                compensationAsOfEpochDate: new Date("2020-12-31T00:00:00.000Z"),
                maxAge: 86400
            

            You will have data with this type of json, from that you should take the data of a company stock through out by access from the top : price, financial data, assetProfile to take all the data

            '

            `],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ])
        
        const agent = createToolCallingAgent({
            llm: groq,
            tools: [infoTool],
            prompt: prompt,
            streamRunnable: false // attempt to work around streaming issue with tools
        });
        
        const agentExecutor = new AgentExecutor({ 
            agent,
            tools: [infoTool],
            verbose: true,
            returnIntermediateSteps: true,
            memory: memory,
        });
        
        const r = await agentExecutor.invoke({ input: input.messages });
        console.log(r);
        
        
        return NextResponse.json({'response': r.output});
    
    }
    
    
    if (input.type === '/exchange'){
        const exchangeToolSchema = z.object({
            fromCurrency: z.string(),
            toCurrency: z.string(),
            
        });

        const exchangeTool = new DynamicStructuredTool({
            name : "exchange",
            description:
            `
                Return the correct exchange rate value given the appropriate fromCurrency and toCurrency.
            `,
    
            schema: exchangeToolSchema,
            func: async ({fromCurrency, toCurrency}) => {
                const queryOptions = { modules: ['price']}
                const query = `${fromCurrency}${toCurrency}=X`
                const data = await yahooFinance.quoteSummary(query,queryOptions as any);
                return data.price!.regularMarketPrice!.toString();
            }
        })

        const memory = new BufferMemory({
            chatHistory: chatHistory,
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            outputKey: "output",
            
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system",`You are my exchange between currency calculator, you will return the rate between 2 type of currency, I will show you sample data
            price: 
                maxAge: 1,
                regularMarketChangePercent: 0.0010462346,
                regularMarketChange: 0.16400146,
                regularMarketTime: 2024-06-10T16:19:35.000Z,
                priceHint: 4,
                regularMarketPrice: 156.916,
                regularMarketDayHigh: 157.193,
                regularMarketDayLow: 156.504,
                regularMarketVolume: 0,
                regularMarketPreviousClose: 156.752,
                regularMarketSource: 'DELAYED',
                regularMarketOpen: 156.725,
                exchange: 'CCY',
                exchangeName: 'CCY',
                exchangeDataDelayedBy: 0,
                marketState: 'REGULAR',
                quoteType: 'CURRENCY',
                symbol: 'JPY=X',
                underlyingSymbol: null,
                shortName: 'USD/JPY',
                longName: 'USD/JPY',
                currency: 'JPY',
                quoteSourceName: 'Delayed Quote',
                currencySymbol: '￥',
                fromCurrency: null,
                toCurrency: null,
                lastMarket: null
              
            You need to remember that if you being ask about exchange rate between them it want to ask about how 1 fromCurrency equal to toCurrency then check for regularMarketPrice
            `],["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],

            

        ])
        const agent = createToolCallingAgent({
            llm: groq,
            tools: [exchangeTool],
            prompt: prompt,
            streamRunnable: false // attempt to work around streaming issue with tools
        });

        const agentExecutor = new AgentExecutor({ 
            agent,
            tools: [exchangeTool],
            verbose: true,
            returnIntermediateSteps: true,
            memory: memory,
        });

        const r = await agentExecutor.invoke({ input: input.messages });
        console.log(r);
        
        
        return NextResponse.json({'response': r.output});
    }

    
    if (input.type === '/info'){
        const newsToolSchema = z.object({
            query: z.string(),
        });         


        const newsTool = new DynamicStructuredTool({
            name: "news",
            description: 
            `
                Return the correct news value given the appropriate query.
            `,
            schema: newsToolSchema,
            func: async ({ query }) => {
                const data = await yahooFinance.search(query);
                
                const listOfNews = data.news.map((news: any) => {
                    return `- ${news.title} : ${news.link}`;
                });
                return listOfNews.join('\n');
            }

            
        });
        const memory = new BufferMemory({
            chatHistory: chatHistory,
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            outputKey: "output",
            
        });


        const prompt = ChatPromptTemplate.fromMessages([
            ["system",`You are my news reader, you will return the news of the query you aska       
            `],["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
        ])

        const agent = createToolCallingAgent({
            llm: groq,
            tools: [newsTool],
            prompt: prompt,
            streamRunnable: false // attempt to work around streaming issue with tools
        });

        const agentExecutor = new AgentExecutor({ 
            agent,
            tools: [newsTool],
            verbose: true,
            returnIntermediateSteps: true,
            memory: memory,
        });

        const r = await agentExecutor.invoke({ input: input.messages });
        console.log(r);
        
        
        return NextResponse.json({'response': r.output});
    }

    if (input.type === '/chat'){
        const memory = new BufferMemory({
            chatHistory: chatHistory,
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            
            
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system",`You are my chatbot, you will provide me with any general information in the world       
            `],["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
            
        ])

        const chatConversationChain = new ConversationChain({
            llm: groq,
            prompt: prompt,
            verbose: true,
            memory: memory,
            outputKey: "output",
          });

        const res = await chatConversationChain.invoke({'input':input.messages});
        console.log(res)
        return NextResponse.json({'response': res.output});
    }

    if(input.type === '/support'){


        
        const memory = new BufferMemory({
            chatHistory: chatHistory,
            memoryKey: "chat_history",
            returnMessages: true,
            inputKey: "input",
            
            
        });

        const prompt = ChatPromptTemplate.fromMessages([
            ["system",`
            You are my transaction information extractor for a query. You will receive a user query in natural language and return the extracted constraints as a JSON object.
            The constraints to extract include:
                - limit: The maximum number of results to return.
                - orderBy: The field to order the results by.
                - orderDirection: The direction to order the results (asc or desc).
                - start: An timestamp to filter the transactions by start date.
                - end: An timestamp to filter the transactions by end date.
                - amount: A condition to filter the transactions by amount (e.g., > 100000).
                - type: A condition to filter out transaction by type (type == "0" is expense, type == "1" is income and type == "2" is transfer).
            You must handle cases where there is no data by returning an appropriate JSON response and with the input of the user you dont change the upper and lower of the input, make it stay the same
            The transaction schema is as follows:
              {{
                "id": "string",
                "account": "string",
                "amount": "number",
                "date": "Date",
                "type": "string",
                "memo": "string",
                "category": "string",
                "toAccount": "string",
                "transferid": "string",
                "from": "boolean"
              }}
            Example response if constraints are extracted successfully:
              {{
                "limit": 10,
                "orderBy": "date",
                "orderDirection": "desc",
                "start": "2024-10-01T00:00:00Z",
                "end": "2024-10-31T23:59:59Z",
                "amount": "> 100000",
                "account: "atm1",
                "category": "food"

              }}
            Example response if no constraints are extracted:
              {{
                "error": "No valid query parameters extracted."
              }}
          
            If some field was lacked then dont include it in the json. And you only return JSON file not anything else
            ` 
        
        ],["placeholder", "{chat_history}"],
            ["human", "{input}"],
            ["placeholder", "{agent_scratchpad}"],
            
        ])

        const chatConversationChain = new ConversationChain({
            llm: groq,
            prompt: prompt,
            verbose: true,
            memory: memory,
            outputKey: "output",
          });

        const res = await chatConversationChain.invoke({'input':input.messages});
        
        // const final = JSON.parse(res.output)
        return NextResponse.json(res.output);
    }
}