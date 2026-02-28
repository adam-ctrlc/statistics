using BoardExam.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace BoardExam.Api.Api.Controllers;

[ApiController]
[Route("api/v1/storage")]
public class StorageController(IStorageService storageService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        try
        {
            var data = await storageService.GetStorageAsync(ct);
            return Ok(new { success = true, data });
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, error = ex.Message });
        }
    }
}
