﻿using System.Collections.Generic;
using System.Threading.Tasks;
using Diet.Core.Dtos;
using Diet.Core.Extensions;
using Diet.Core.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Diet.SPA.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MealsController : ControllerBase
    {
        private readonly IMealsService _mealsService;

        public MealsController(IMealsService mealsService)
        {
            _mealsService = mealsService;
        }

        [HttpGet]
        public async Task<List<MealDto>> Get()
        {
            List<MealDto> result = await _mealsService.Get(User.GetLoggedInUserId<string>());

            return result;
        }

        [HttpPut]
        public async Task<ActionResult> CreateUpdate(MealDto mealDto)
        {
            await _mealsService.CreateUpdate(mealDto);

            return NoContent();
        }

        [HttpDelete]
        public async Task<ActionResult> Delete(int id)
        {
            await _mealsService.Delete(id);

            return NoContent();
        }
    }
}