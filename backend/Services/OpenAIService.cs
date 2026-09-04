using Azure;
using Azure.AI.OpenAI;
using OpenAI.Chat;
using Microsoft.Extensions.Configuration;

public class OpenAIService
{
    private readonly ChatClient _chatClient;

    public OpenAIService(IConfiguration configuration)
    {
        string endpoint = configuration["AzureOpenAI:Endpoint"]!;
        string apiKey = configuration["AzureOpenAI:ApiKey"]!;
        string deploymentName = configuration["AzureOpenAI:DeploymentName"]!;

        AzureOpenAIClient azureClient = new(new Uri(endpoint), new AzureKeyCredential(apiKey));
        _chatClient = azureClient.GetChatClient(deploymentName);
    }

    public async Task<string> GetAiResponseAsync(string prompt)
    {
        ChatCompletion completion = await _chatClient.CompleteChatAsync(prompt);
        return completion.Content[0].Text;
    }
}